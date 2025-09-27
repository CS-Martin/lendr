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

    if (nextStepNumber === 3) {
      // Step 3: Rental period starts - record the start time
      await ctx.db.patch(escrowId, { rentalStartTime: Date.now() });
    }

    if (nextStep) {
      await ctx.db.patch(nextStep._id, { status: 'ACTIVE', timestamp: Date.now() });
    }

    // Special handling for step 4 (settlement) - automatically complete the escrow
    if (stepNumber === 4) {
      await ctx.db.patch(escrowId, { status: 'COMPLETED' });
    }
  },
});

// New mutation for completing step 4 (settlement)
export const completeStep4Settlement = mutation({
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

    // Complete step 4 (settlement)
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

    // Mark escrow as completed
    await ctx.db.patch(escrowId, { status: 'COMPLETED' });

    return { success: true, message: 'Settlement completed successfully' };
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

    // No additional deadline checks needed since step 4 is automatic settlement

    return { action: 'NONE', reason: 'No deadlines exceeded' };
  },
});
