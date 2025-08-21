import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const EscrowStepStatus = v.union(v.literal('COMPLETED'), v.literal('ACTIVE'), v.literal('PENDING'));

export const escrowSteps = defineTable({
  escrowId: v.id('escrows'),
  stepNumber: v.number(), // 1, 2, 3...
  title: v.string(), // e.g., "Borrower Sends Payment"
  description: v.string(), // Details
  status: EscrowStepStatus, // Step status
  txHash: v.optional(v.string()), // Optional transaction hash
  timestamp: v.number(), // When step was completed
});
