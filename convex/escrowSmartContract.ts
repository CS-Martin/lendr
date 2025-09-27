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
  step2ExpiresAt: v.optional(v.number()), // Step 2 deadline (lender sends NFT)
  step4ExpiresAt: v.optional(v.number()), // Step 4 deadline (renter returns NFT)
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

    const escrowId = await ctx.db.insert('escrowSmartContracts', {
      ...args,
    });

    // Create the steps
    const steps = [
      {
        escrowId,
        stepNumber: 1,
        status: 'ACTIVE' as const,
        title: 'Renter Pays',
        description: 'Renter deposits collateral and rental fee into escrow.',
        details: 'The renter must pay the total amount to proceed.',
        timestamp: Date.now(),
      },
      {
        escrowId,
        stepNumber: 2,
        status: 'PENDING' as const,
        title: 'Lender Sends NFT',
        description: 'Lender must send the NFT to the escrow contract.',
        details: 'The lender has 24 hours to send the NFT.',
        warning: 'If the deadline is missed, the escrow will be cancelled.',
        timestamp: 0,
      },
      {
        escrowId,
        stepNumber: 3,
        status: 'PENDING' as const,
        title: 'Rental Period',
        description: 'The rental period begins.',
        details: 'The NFT is held in escrow during the rental period.',
        timestamp: 0,
      },
      {
        escrowId,
        stepNumber: 4,
        status: 'PENDING' as const,
        title: 'Renter Returns NFT',
        description: 'Renter must return the NFT to the lender.',
        details: 'The renter has 3 days to return the NFT after the rental period ends.',
        warning: 'If the deadline is missed, the collateral will be forfeited.',
        timestamp: 0,
      },
      {
        escrowId,
        stepNumber: 5,
        status: 'PENDING' as const,
        title: 'Settlement',
        description: 'Payouts are distributed.',
        details: 'The rental fee is sent to the lender and the collateral is returned to the renter.',
        timestamp: 0,
      },
    ];

    for (const step of steps) {
      await ctx.db.insert('escrowSmartContractSteps', step);
    }

    return escrowId;
  },
});

export const getEscrowSmartContract = query({
  args: {
    rentalPostId: v.id('rentalposts'),
  },
  handler: async (ctx, args) => {
    const escrow = await ctx.db
      .query('escrowSmartContracts')
      .withIndex('by_rentalPostId', (q) => q.eq('rentalPostId', args.rentalPostId))
      .unique();

    if (!escrow) {
      return null;
    }

    const steps = await ctx.db
      .query('escrowSmartContractSteps')
      .filter((q) => q.eq(q.field('escrowId'), escrow._id))
      .collect();

    return {
      ...escrow,
      steps,
    };
  },
});

export const cancelEscrow = mutation({
  args: {
    id: v.id('escrowSmartContracts'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: 'CANCELLED' });
  },
});

export const defaultEscrow = mutation({
  args: {
    id: v.id('escrowSmartContracts'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: 'DEFAULTED' });
  },
});

export const settleEscrow = mutation({
  args: {
    id: v.id('escrowSmartContracts'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: 'COMPLETED' });
  },
});

// Get escrow contracts by user address (as renter)
export const getEscrowContractsByRenter = query({
  args: {
    renterAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const escrows = await ctx.db
      .query('escrowSmartContracts')
      .withIndex('by_rentalPostRenterAddress', (q) => q.eq('rentalPostRenterAddress', args.renterAddress))
      .collect();

    // Get steps for each escrow
    const escrowsWithSteps = await Promise.all(
      escrows.map(async (escrow) => {
        const steps = await ctx.db
          .query('escrowSmartContractSteps')
          .filter((q) => q.eq(q.field('escrowId'), escrow._id))
          .collect();
        return { ...escrow, steps };
      }),
    );

    return escrowsWithSteps;
  },
});

// Get escrow contracts by user address (as lender/owner)
export const getEscrowContractsByOwner = query({
  args: {
    ownerAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const escrows = await ctx.db
      .query('escrowSmartContracts')
      .withIndex('by_rentalPostOwnerAddress', (q) => q.eq('rentalPostOwnerAddress', args.ownerAddress))
      .collect();

    // Get steps for each escrow
    const escrowsWithSteps = await Promise.all(
      escrows.map(async (escrow) => {
        const steps = await ctx.db
          .query('escrowSmartContractSteps')
          .filter((q) => q.eq(q.field('escrowId'), escrow._id))
          .collect();
        return { ...escrow, steps };
      }),
    );

    return escrowsWithSteps;
  },
});

// Get all escrow contracts with their steps
export const getAllEscrowContracts = query({
  args: {},
  handler: async (ctx) => {
    const escrows = await ctx.db.query('escrowSmartContracts').collect();

    // Get steps for each escrow
    const escrowsWithSteps = await Promise.all(
      escrows.map(async (escrow) => {
        const steps = await ctx.db
          .query('escrowSmartContractSteps')
          .filter((q) => q.eq(q.field('escrowId'), escrow._id))
          .collect();
        return { ...escrow, steps };
      }),
    );

    return escrowsWithSteps;
  },
});

// Force complete step 4 and 5 (for testing or manual intervention)
export const forceCompleteRentalProcess = mutation({
  args: {
    escrowId: v.id('escrowSmartContracts'),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { escrowId, txHash } = args;

    // Get the escrow contract
    const escrow = await ctx.db.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow contract not found');
    }

    // Complete step 4 (NFT return)
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

    // Complete step 5 (settlement)
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

    return { success: true, message: 'Rental process completed successfully' };
  },
});
