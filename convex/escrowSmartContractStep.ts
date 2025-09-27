import { defineTable } from 'convex/server';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const EscrowStepStatus = v.union(v.literal('COMPLETED'), v.literal('ACTIVE'), v.literal('PENDING'));

export const escrowSmartContractStep = defineTable({
  escrowId: v.id('escrowSmartContracts'),
  stepNumber: v.number(), // 1, 2, 3...
  status: EscrowStepStatus, // Step status
  txHash: v.optional(v.string()), // Optional transaction hash
  title: v.string(),
  description: v.string(),
  details: v.string(),
  warning: v.optional(v.string()),
  timestamp: v.number(), // When step was completed
});

export const getEscrowSmartContractSteps = query({
  args: {
    escrowId: v.id('escrowSmartContracts'),
  },
  handler: async (ctx, args) => {
    const { escrowId } = args;
    return ctx.db
      .query('escrowSmartContractSteps')
      .filter((q) => q.eq(q.field('escrowId'), escrowId))
      .order('asc')
      .collect();
  },
});

export const completeStep = mutation({
  args: {
    escrowId: v.id('escrowSmartContracts'),
    stepNumber: v.number(),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { escrowId, stepNumber, txHash } = args;

    // Find the current step
    const currentStep = await ctx.db
      .query('escrowSmartContractSteps')
      .filter((q) => q.eq(q.field('escrowId'), escrowId))
      .filter((q) => q.eq(q.field('stepNumber'), stepNumber))
      .unique();

    if (!currentStep) {
      throw new Error(`Step ${stepNumber} not found for escrow ${escrowId}`);
    }

    // Update the current step to COMPLETED
    await ctx.db.patch(currentStep._id, {
      status: 'COMPLETED',
      timestamp: Date.now(),
      txHash: txHash || '0xabc123de...89abc123', // Use provided txHash or default
    });

    // If there is a next step, update it to ACTIVE
    const nextStepNumber = stepNumber + 1;
    const nextStep = await ctx.db
      .query('escrowSmartContractSteps')
      .filter((q) => q.eq(q.field('escrowId'), escrowId))
      .filter((q) => q.eq(q.field('stepNumber'), nextStepNumber))
      .unique();

    // Set deadlines for specific steps
    if (nextStepNumber === 2) {
      // Step 2: Lender has 24 hours to send NFT
      await ctx.db.patch(escrowId, { step2ExpiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    }

    if (nextStepNumber === 4) {
      // Step 4: Renter has 72 hours to return NFT
      await ctx.db.patch(escrowId, { step4ExpiresAt: Date.now() + 72 * 60 * 60 * 1000 });
    }

    if (nextStep) {
      await ctx.db.patch(nextStep._id, { status: 'ACTIVE', timestamp: Date.now() });
    }

    // Special handling for step 5 (settlement) - automatically complete the escrow
    if (stepNumber === 5) {
      await ctx.db.patch(escrowId, { status: 'COMPLETED' });
    }
  },
});

// New mutation specifically for completing step 4 (NFT return)
export const completeStep4ReturnNFT = mutation({
  args: {
    escrowId: v.id('escrowSmartContracts'),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { escrowId, txHash } = args;

    // Get the escrow contract to verify it exists and is in the right state
    const escrow = await ctx.db.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow contract not found');
    }

    if (escrow.status !== 'ACTIVE') {
      throw new Error('Escrow contract is not in active state');
    }

    // Check if step 4 deadline has passed
    if (escrow.step4ExpiresAt && Date.now() > escrow.step4ExpiresAt) {
      throw new Error('Step 4 deadline has passed. The renter has defaulted.');
    }

    // Complete step 4
    const step4 = await ctx.db
      .query('escrowSmartContractSteps')
      .filter((q) => q.eq(q.field('escrowId'), escrowId))
      .filter((q) => q.eq(q.field('stepNumber'), 4))
      .unique();

    if (step4) {
      await ctx.db.patch(step4._id, {
        status: 'COMPLETED',
        timestamp: Date.now(),
        txHash: txHash || '0xabc123de...89abc123',
      });
    }

    // Automatically proceed to step 5 (settlement)
    const step5 = await ctx.db
      .query('escrowSmartContractSteps')
      .filter((q) => q.eq(q.field('escrowId'), escrowId))
      .filter((q) => q.eq(q.field('stepNumber'), 5))
      .unique();

    if (step5) {
      await ctx.db.patch(step5._id, {
        status: 'COMPLETED',
        timestamp: Date.now(),
        txHash: txHash || '0xabc123de...89abc123',
      });
    }

    // Mark escrow as completed
    await ctx.db.patch(escrowId, { status: 'COMPLETED' });

    return { success: true, message: 'NFT returned successfully and settlement completed' };
  },
});

// New mutation for checking and handling expired deadlines
export const checkDeadlines = mutation({
  args: {
    escrowId: v.id('escrowSmartContracts'),
  },
  handler: async (ctx, args) => {
    const { escrowId } = args;

    const escrow = await ctx.db.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow contract not found');
    }

    const now = Date.now();

    // Check step 2 deadline (lender didn't send NFT)
    if (escrow.step2ExpiresAt && now > escrow.step2ExpiresAt) {
      // Check if step 2 is still pending (lender didn't complete it)
      const step2 = await ctx.db
        .query('escrowSmartContractSteps')
        .filter((q) => q.eq(q.field('escrowId'), escrowId))
        .filter((q) => q.eq(q.field('stepNumber'), 2))
        .unique();

      if (step2 && step2.status === 'PENDING') {
        // Cancel the escrow
        await ctx.db.patch(escrowId, { status: 'CANCELLED' });
        return { action: 'CANCELLED', reason: 'Lender failed to send NFT within deadline' };
      }
    }

    // Check step 4 deadline (renter didn't return NFT)
    if (escrow.step4ExpiresAt && now > escrow.step4ExpiresAt) {
      // Check if step 4 is still pending (renter didn't complete it)
      const step4 = await ctx.db
        .query('escrowSmartContractSteps')
        .filter((q) => q.eq(q.field('escrowId'), escrowId))
        .filter((q) => q.eq(q.field('stepNumber'), 4))
        .unique();

      if (step4 && step4.status === 'PENDING') {
        // Default the escrow (collateral goes to lender)
        await ctx.db.patch(escrowId, { status: 'DEFAULTED' });
        return { action: 'DEFAULTED', reason: 'Renter failed to return NFT within deadline' };
      }
    }

    return { action: 'NONE', reason: 'No deadlines exceeded' };
  },
});
