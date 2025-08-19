import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { defineTable } from 'convex/server';

export const nft = defineTable({
  contractAddress: v.string(),
  tokenId: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  imageUrl: v.string(),
  collectionName: v.optional(v.string()),
  floorPrice: v.optional(v.float64()),
  category: v.optional(v.string()),
  metadata: v.any(),
  isListable: v.boolean(),
  ownerAddress: v.string(),
})
  .index('by_ownerAddress', ['ownerAddress'])
  .index('by_collectionName', ['collectionName'])
  .index('by_contractAddress_tokenId', ['contractAddress', 'tokenId']);

export const createNft = mutation({
  args: {
    contractAddress: v.string(),
    tokenId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.string(),
    collectionName: v.optional(v.string()),
    floorPrice: v.optional(v.float64()),
    category: v.optional(v.string()),
    metadata: v.any(),
    isListable: v.boolean(),
    ownerAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('nfts', args);
  },
});

export const updateNft = mutation({
  args: {
    id: v.id('nfts'),
    isListable: v.optional(v.boolean()),
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
