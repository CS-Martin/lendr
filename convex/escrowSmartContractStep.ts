import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const EscrowStepStatus = v.union(v.literal('COMPLETED'), v.literal('ACTIVE'), v.literal('PENDING'));

export const escrowSmartContractStep = defineTable({
  escrowId: v.id('escrowSmartContracts'),
  stepNumber: v.number(), // 1, 2, 3...
  status: EscrowStepStatus, // Step status
  txHash: v.optional(v.string()), // Optional transaction hash
  timestamp: v.number(), // When step was completed
});
