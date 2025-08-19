import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { defineTable } from 'convex/server';

export const nft = defineTable({
  ownerAddress: v.string(),
  nftContractAddress: v.string(),
  nftMetadata: v.any(),
  isListable: v.boolean(),
}).index('by_ownerAddress', ['ownerAddress']);

export const createNft = mutation({
  args: {
    ownerAddress: v.string(),
    nftContractAddress: v.string(),
    nftMetadata: v.any(),
    isListable: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('nfts', args);
  },
});

export const updateNft = mutation({
  args: {
    id: v.id('nfts'),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const deleteNft = mutation({
  args: { id: v.id('nfts') },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getNftsByOwner = query({
  args: { ownerAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('nfts')
      .withIndex('by_ownerAddress', (q) => q.eq('ownerAddress', args.ownerAddress))
      .collect();
  },
});
