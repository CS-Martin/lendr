// convex/bids.ts
import { defineTable, paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';

export const bids = defineTable({
  rentalPostId: v.id('rentalposts'),
  bidderAddress: v.string(),
  message: v.optional(v.string()),
  bidAmount: v.number(),
  totalBidAmount: v.number(), // Total bid amount with collateral included
  rentalDuration: v.number(),
  isAccepted: v.boolean(),
  acceptedTimestamp: v.optional(v.number()),
  updatedTime: v.number(),
})
  .index('by_rentalPost', ['rentalPostId'])
  .index('by_bidder', ['bidderAddress'])
  .index('by_rentalPost_total', ['rentalPostId', 'totalBidAmount'])
  .index('by_rentalPost_bidder', ['rentalPostId', 'bidderAddress']); // New index for user restriction

export const placeBid = mutation({
  args: {
    rentalPostId: v.id('rentalposts'),
    bidderAddress: v.string(),
    message: v.optional(v.string()),
    bidAmount: v.number(),
    totalBidAmount: v.number(),
    rentalDuration: v.number(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    const rentalPost = await ctx.db.get(args.rentalPostId);
    if (!rentalPost) {
      throw new Error('Rental post not found');
    }

    if (rentalPost.posterAddress === args.bidderAddress) {
      throw new Error('You cannot bid on your own rental post');
    }

    // Check if user already has a bid for this rental post
    const existingBid = await ctx.db
      .query('bids')
      .withIndex('by_rentalPost_bidder', (q) =>
        q.eq('rentalPostId', args.rentalPostId).eq('bidderAddress', args.bidderAddress),
      )
      .first();

    if (existingBid) {
      // Update existing bid
      return await ctx.db.patch(existingBid._id, {
        message: args.message,
        bidAmount: args.bidAmount,
        totalBidAmount: args.totalBidAmount,
        rentalDuration: args.rentalDuration,
        updatedTime: timestamp,
      });
    }

    // Create new bid
    return await ctx.db.insert('bids', {
      ...args,
      isAccepted: false,
      updatedTime: timestamp,
    });
  },
});

export const getBidsByRentalPostTotalValue = query({
  args: {
    rentalPostId: v.id('rentalposts'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { rentalPostId, paginationOpts }) => {
    // Get all bids first (this might need optimization for large datasets)
    const allBids = await ctx.db
      .query('bids')
      .withIndex('by_rentalPost', (q) => q.eq('rentalPostId', rentalPostId))
      .collect();

    // Sort by total value
    const sortedBids = allBids.sort((a, b) => b.totalBidAmount - a.totalBidAmount);

    // Implement manual pagination
    const startIndex = paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0;
    const endIndex = startIndex + paginationOpts.numItems;
    const page = sortedBids.slice(startIndex, endIndex);

    return {
      page,
      continueCursor: endIndex < sortedBids.length ? endIndex.toString() : null,
      isDone: endIndex >= sortedBids.length,
    };
  },
});

export const getBidsByRentalPost = query({
  args: {
    rentalPostId: v.id('rentalposts'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { rentalPostId, paginationOpts }) => {
    return await ctx.db
      .query('bids')
      .withIndex('by_rentalPost_total', (q) => q.eq('rentalPostId', rentalPostId))
      .order('desc')
      .paginate(paginationOpts);
  },
});

export const getUserBidForRentalPost = query({
  args: {
    rentalPostId: v.id('rentalposts'),
    bidderAddress: v.string(),
  },
  handler: async (ctx, { rentalPostId, bidderAddress }) => {
    return await ctx.db
      .query('bids')
      .withIndex('by_rentalPost_bidder', (q) => q.eq('rentalPostId', rentalPostId).eq('bidderAddress', bidderAddress))
      .first();
  },
});

export const getBidById = query({
  args: {
    bidId: v.id('bids'),
  },
  handler: async (ctx, { bidId }) => {
    return await ctx.db.get(bidId as Id<'bids'>);
  },
});

export const getHighestBid = query({
  args: {
    rentalPostId: v.id('rentalposts'),
  },
  handler: async (ctx, { rentalPostId }) => {
    const bids = await ctx.db
      .query('bids')
      .withIndex('by_rentalPost_total', (q) => q.eq('rentalPostId', rentalPostId))
      .order('desc')
      .first();

    return bids;
  },
});

export const acceptBid = mutation({
  args: { bidId: v.id('bids') },
  handler: async (ctx, { bidId }) => {
    const bid = await ctx.db.get(bidId);

    if (!bid) {
      throw new Error('Bid not found');
    }

    // Update bid status
    await ctx.db.patch(bidId, { isAccepted: true, acceptedTimestamp: Date.now() });

    // Update rental post status and renter address
    await ctx.db.patch(bid.rentalPostId, { status: 'RENTED', renterAddress: bid.bidderAddress });

    // Reject all other bids for this rental post
    const otherBids = await ctx.db
      .query('bids')
      .withIndex('by_rentalPost', (q) => q.eq('rentalPostId', bid.rentalPostId))
      .filter((q) => q.neq(q.field('_id'), bidId))
      .collect();

    for (const otherBid of otherBids) {
      await ctx.db.patch(otherBid._id, { isAccepted: false });
    }

    return { success: true };
  },
});

export const rejects = mutation({
  args: { bidId: v.id('bids') },
  handler: async (ctx, { bidId }) => {
    return await ctx.db.patch(bidId, { isAccepted: false });
  },
});

export const deleteBid = mutation({
  args: { bidId: v.id('bids') },
  handler: async (ctx, { bidId }) => {
    const bid = await ctx.db.get(bidId);

    if (!bid) {
      throw new Error('Bid not found');
    }
    return await ctx.db.delete(bidId);
  },
});
