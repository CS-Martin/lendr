import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { mutation } from './_generated/server';

// Escrow contract lifecycle statuses
export const EscrowSmartContractStatus = v.union(
  v.literal('ACTIVE'), // Escrow ongoing (renter paid, NFT in use, or waiting return)
  v.literal('CANCELLED'), // Escrow cancelled (lender didn’t send NFT within deadline)
  v.literal('DEFAULTED'), // Escrow defaulted (renter failed to return NFT in time, collateral goes to lender)
  v.literal('COMPLETED'), // Escrow completed successfully (NFT returned, payout distributed)
);

export const escrowSmartContract = defineTable({
  rentalPost: v.id('rentalposts'),
  rentalPostRenterAddress: v.string(),
  rentalPostOwnerAddress: v.string(),
  rentalFee: v.number(),
  collateral: v.number(),
  status: EscrowSmartContractStatus,
  step2ExpiresAt: v.number(), // Step 2 deadline (lender sends NFT)
  step4ExpiresAt: v.number(), // Step 4 deadline (renter returns NFT)
});

export const createEscrowSmartContract = mutation({
  args: {
    rentalPost: v.id('rentalposts'),
    rentalPostRenterAddress: v.string(),
    rentalPostOwnerAddress: v.string(),
    rentalFee: v.number(),
    collateral: v.number(),
    status: EscrowSmartContractStatus,
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('escrowSmartContracts', {
      ...args,
      step2ExpiresAt: 24, // 24 hrs eq to 1 day
      step4ExpiresAt: 72, // 72 hrs eq to 3 days
    });
  },
});
