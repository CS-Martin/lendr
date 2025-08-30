import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { defineTable, paginationOptsValidator } from 'convex/server';
import { Id } from './_generated/dataModel';

export const RentalListingStatus = v.union(v.literal('AVAILABLE'), v.literal('RENTED'));

export const rentalpost = defineTable({
  posterAddress: v.string(),
  renterAddress: v.optional(v.string()),
  name: v.string(),
  description: v.optional(v.string()),
  hourlyRate: v.number(),
  collateral: v.number(),
  rentalDuration: v.number(),
  category: v.string(),
  isBiddable: v.boolean(),
  biddingStartTime: v.optional(v.number()),
  biddingEndTime: v.optional(v.number()),
  status: RentalListingStatus,
  nftMetadata: v.any(),
})
  .index('by_posterAddress', ['posterAddress'])
  .index('by_renterAddress', ['renterAddress'])
  .index('by_status', ['status']);

export const createRentalPost = mutation({
  args: {
    posterAddress: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    hourlyRate: v.float64(),
    collateral: v.float64(),
    rentalDuration: v.number(),
    category: v.string(),
    isBiddable: v.boolean(),
    biddingStartTime: v.optional(v.number()),
    biddingEndTime: v.optional(v.number()),
    status: RentalListingStatus,
    nftMetadata: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('rentalposts', args);
  },
});

export const updateRentalPost = mutation({
  args: {
    id: v.id('rentalposts'),
    hourlyRate: v.optional(v.float64()),
    collateral: v.optional(v.float64()),
    isBiddable: v.optional(v.boolean()),
    biddingStarttime: v.optional(v.number()),
    biddingEndtime: v.optional(v.number()),
    status: v.optional(RentalListingStatus),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const deleteRentalPost = mutation({
  args: { id: v.id('rentalposts') },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getOneRentalPost = query({
  args: {
    id: v.optional(v.id('rentalposts')),
  },
  handler: async (ctx, args) => {
    const rentalPost = await ctx.db.get(args.id as Id<'rentalposts'>);

    if (!rentalPost) {
      throw new Error('Rental post not found');
    }

    return rentalPost;
  },
});

export const getRentalPosts = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    return await ctx.db.query('rentalposts').order('desc').paginate(paginationOpts);
  },
});

export const getOwnedRentalPosts = query({
  args: { ownerAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('rentalposts')
      .withIndex('by_posterAddress', (q) => q.eq('posterAddress', args.ownerAddress))
      .order('desc')
      .collect();
  },
});

export const getBorrowedRentalPosts = query({
  args: { renterAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('rentalposts')
      .withIndex('by_renterAddress', (q) => q.eq('renterAddress', args.renterAddress))
      .order('desc')
      .collect();
  },
});
