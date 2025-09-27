import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { mutation, query, action } from './_generated/server';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';

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
  rentalStartTime: v.optional(v.number()), // When step 3 (rental period) started
  smartContractRentalId: v.optional(v.string()), // ID from delegation rental agreement API
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

    // Get bid and rental post data for API call
    const bid = await ctx.db.get(args.bidId);
    const rentalPost = await ctx.db.get(args.rentalPostId);

    if (!bid || !rentalPost) {
      throw new Error('Bid or rental post not found.');
    }

    // Note: API call will be handled in a separate action
    // This mutation creates the escrow without the smart contract ID initially
    const smartContractRentalId: string | undefined = undefined;

    const escrowId = await ctx.db.insert('escrowSmartContracts', {
      ...args,
      smartContractRentalId,
    });

    // Create the steps
    const steps = [
      {
        escrowId,
        stepNumber: 1,
        status: 'ACTIVE' as const,
        title: 'Renter Pays',
        description: 'Renter deposits rental fee into escrow.',
        details: 'The renter must pay the rental fee to proceed.',
        timestamp: Date.now(),
      },
      {
        escrowId,
        stepNumber: 2,
        status: 'PENDING' as const,
        title: 'Lender Sends NFT',
        description: 'Lender must send the NFT to the escrow contract registry.',
        details: 'The lender has 24 hours to send the NFT to the smart contract registry.',
        warning: 'If the deadline is missed, the escrow will be cancelled.',
        timestamp: 0,
      },
      {
        escrowId,
        stepNumber: 3,
        status: 'PENDING' as const,
        title: 'Rental Period',
        description: 'The rental period begins.',
        details: 'The NFT is held in the smart contract registry during the rental period.',
        timestamp: 0,
      },
      {
        escrowId,
        stepNumber: 4,
        status: 'PENDING' as const,
        title: 'Settlement',
        description: 'Automatic settlement and NFT return.',
        details: 'The rental fee is sent to the lender and the NFT is automatically returned from the registry.',
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

// Force complete step 4 (settlement) (for testing or manual intervention)
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

    return { success: true, message: 'Rental process completed successfully' };
  },
});

// Mutation to update escrow smart contract rental ID
export const updateEscrowSmartContractRentalId = mutation({
  args: {
    escrowId: v.id('escrowSmartContracts'),
    smartContractRentalId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.escrowId, {
      smartContractRentalId: args.smartContractRentalId,
    });
  },
});

// Action to initiate delegation rental payment (Step 1)
export const initiateDelegationRentalPayment = action({
  args: {
    rentalId: v.string(),
    payment: v.string(), // Payment amount in wei
  },
  handler: async (ctx, args) => {
    try {
      console.log('Initiate Delegation Rental Payment Request:', args);

      const apiResponse = await fetch('https://lendr.gabcat.dev/delegation/initiate-delegation-rental', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rentalId: args.rentalId,
          payment: args.payment,
        }),
      });

      console.log('Initiate Delegation Rental Payment Response:', apiResponse);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Payment failed with status: ${apiResponse.status} - ${errorText}`);
      }

      const result = await apiResponse.json();
      return { success: true, result };
    } catch (error) {
      console.error('Failed to initiate delegation rental payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// Action to create delegation rental agreement via external API
export const createDelegationRentalAgreement = action({
  args: {
    lender: v.string(),
    nftContract: v.string(),
    tokenId: v.string(),
    hourlyRentalFee: v.string(),
    rentalDurationInHours: v.string(),
    nftStandard: v.number(),
    dealDuration: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const apiResponse = await fetch('https://lendr.gabcat.dev/factory/create-delegation-rental-agreement', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      });

      if (!apiResponse.ok) {
        throw new Error(`API call failed with status: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
      return { success: true, smartContractRentalId: result.result };
    } catch (error) {
      console.error('Failed to create delegation rental agreement:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// Action to create escrow smart contract with API integration
export const createEscrowSmartContractWithAPI = action({
  args: {
    bidId: v.id('bids'),
    rentalPostId: v.id('rentalposts'),
    rentalPostRenterAddress: v.string(),
    rentalPostOwnerAddress: v.string(),
    status: EscrowSmartContractStatus,
  },
  handler: async (ctx, args): Promise<Id<'escrowSmartContracts'>> => {
    // First, get bid and rental post data for API call
    const bid = await ctx.runQuery(api.bids.getBidById, { bidId: args.bidId });
    const rentalPost = await ctx.runQuery(api.rentalpost.get, { id: args.rentalPostId });

    if (!bid || !rentalPost) {
      throw new Error('Bid or rental post not found.');
    }

    console.log('rentalPostOwnerAddress', args.rentalPostOwnerAddress);
    console.log('nftContract', rentalPost.nftMetadata.contract?.address);
    console.log('tokenId', rentalPost.nftMetadata.tokenId);
    console.log('hourlyRentalFee', Math.floor(bid.bidAmount * 1e18).toString());
    console.log('rentalDurationInHours', bid.rentalDuration.toString());

    // Call the delegation rental agreement API first
    const apiResult = await ctx.runAction(api.escrowSmartContract.createDelegationRentalAgreement, {
      lender: args.rentalPostOwnerAddress,
      nftContract: rentalPost.nftMetadata.contract?.address || '',
      tokenId: rentalPost.nftMetadata.tokenId || '',
      hourlyRentalFee: Math.floor(bid.bidAmount * 1e18).toString(), // Convert to wei with proper rounding
      rentalDurationInHours: bid.rentalDuration.toString(),
      nftStandard: 0, // ERC721
      dealDuration: 0, // SIX_HOURS
    });

    // If API call is not successful, don't create the escrow
    if (!apiResult.success) {
      throw new Error(`Failed to create delegation rental agreement: ${apiResult.error || 'Unknown error'}`);
    }

    // Only create the escrow smart contract if API call was successful
    const escrowId: Id<'escrowSmartContracts'> = await ctx.runMutation(
      api.escrowSmartContract.createEscrowSmartContract,
      args,
    );

    // Update the escrow with the smart contract rental ID
    if (apiResult.smartContractRentalId) {
      await ctx.runMutation(api.escrowSmartContract.updateEscrowSmartContractRentalId, {
        escrowId,
        smartContractRentalId: apiResult.smartContractRentalId,
      });
    }

    return escrowId;
  },
});
