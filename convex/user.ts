import { v } from 'convex/values';
import { defineTable } from 'convex/server';
import { mutation, query } from './_generated/server';

export const user = defineTable({
  address: v.string(),
  username: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  bio: v.optional(v.string()),
  name: v.optional(v.string()),
}).index('by_address', ['address']);

export const getUser = query({
  args: {
    address: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_address', (q) => q.eq('address', args.address))
      .unique();
  },
});

export const getOrCreateUser = mutation({
  args: {
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_address', (q) => q.eq('address', args.address))
      .unique();

    if (user !== null) {
      return user;
    }

    const userId = await ctx.db.insert('users', {
      address: args.address,
    });

    return await ctx.db.get(userId);
  },
});
