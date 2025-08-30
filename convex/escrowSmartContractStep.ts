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
      txHash,
    });

    // If there is a next step, update it to ACTIVE
    const nextStepNumber = stepNumber + 1;
    const nextStep = await ctx.db
      .query('escrowSmartContractSteps')
      .filter((q) => q.eq(q.field('escrowId'), escrowId))
      .filter((q) => q.eq(q.field('stepNumber'), nextStepNumber))
      .unique();

    if (nextStep) {
      await ctx.db.patch(nextStep._id, { status: 'ACTIVE', timestamp: Date.now() });
    }
  },
});
