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

      // Hardcode for now
      txHash: '0xabc123de...89abc123',
    });

    // If there is a next step, update it to ACTIVE
    const nextStepNumber = stepNumber + 1;
    const nextStep = await ctx.db
      .query('escrowSmartContractSteps')
      .filter((q) => q.eq(q.field('escrowId'), escrowId))
      .filter((q) => q.eq(q.field('stepNumber'), nextStepNumber))
      .unique();

    // If step 2, update escrowSmartContract step2ExpiresAt to 24 hours from now
    if (nextStepNumber === 2) {
      await ctx.db.patch(escrowId, { step2ExpiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    }

    // If step 4, update escrowSmartContract step4ExpiresAt to 72 hours from now
    if (nextStepNumber === 4) {
      await ctx.db.patch(escrowId, { step4ExpiresAt: Date.now() + 72 * 60 * 60 * 1000 });
    }

    if (nextStep) {
      await ctx.db.patch(nextStep._id, { status: 'ACTIVE', timestamp: Date.now() });
    }
  },
});
