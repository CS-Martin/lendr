import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Escrow contract lifecycle statuses
export const EscrowSmartContractStatus = v.union(
  v.literal('ACTIVE'), // Escrow ongoing (renter paid, NFT in use, or waiting return)
  v.literal('CANCELLED'), // Escrow cancelled (lender didn’t send NFT within deadline)
  v.literal('DEFAULTED'), // Escrow defaulted (renter failed to return NFT in time, collateral goes to lender)
  v.literal('COMPLETED'), // Escrow completed successfully (NFT returned, payout distributed)
);

export const escrowSmartContract = defineTable({
  bidId: v.id('bids'),
  rentalPostId: v.id('rentalposts'),
  rentalPostRenterAddress: v.string(),
  rentalPostOwnerAddress: v.string(),
  status: EscrowSmartContractStatus,
  step2ExpiresAt: v.number(), // Step 2 deadline (lender sends NFT)
  step4ExpiresAt: v.number(), // Step 4 deadline (renter returns NFT)
})
  .index('by_rentalPostId', ['rentalPostId'])
  .index('by_rentalPostRenterAddress', ['rentalPostRenterAddress'])
  .index('by_rentalPostOwnerAddress', ['rentalPostOwnerAddress']);

export const createEscrowSmartContract = mutation({
  args: {
    bidId: v.id('bids'),
    rentalPostId: v.id('rentalposts'),
    rentalPostRenterAddress: v.string(),
    rentalPostOwnerAddress: v.string(),
    status: EscrowSmartContractStatus,
  },
  handler: async (ctx, args) => {
    // Check if rental post already has an escrow contract
    const existingContract = await ctx.db
      .query('escrowSmartContracts')
      .withIndex('by_rentalPostId', (q) => q.eq('rentalPostId', args.rentalPostId))
      .unique();

    if (existingContract) {
      throw new Error('This rental post is already associated with an escrow contract.');
    }

    return await ctx.db.insert('escrowSmartContracts', {
      ...args,
      step2ExpiresAt: 24, // 24 hrs eq to 1 day
      step4ExpiresAt: 72, // 72 hrs eq to 3 days
    });
  },
});

export const getEscrowSmartContract = query({
  args: {
    rentalPostId: v.id('rentalposts'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('escrowSmartContracts')
      .withIndex('by_rentalPostId', (q) => q.eq('rentalPostId', args.rentalPostId))
      .unique();
  },
});
