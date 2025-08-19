import { v } from 'convex/values';
import { defineTable } from 'convex/server';
import { mutation, query } from './_generated/server';

export const user = defineTable({
  address: v.string(),
  username: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  bio: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
}).index('by_address', ['address']);

// update user
export const updateUser = mutation({
  args: {
    address: v.string(),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_address', (q) => q.eq('address', args.address))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = {
      username: args.username ?? user.username,
      avatarUrl: args.avatarUrl ?? user.avatarUrl,
      bio: args.bio ?? user.bio,
      updatedAt: Date.now(),
    };

    await ctx.db.patch(user._id, updatedUser);

    return { ...user, ...updatedUser };
  },
});

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

    const creationTime = new Date();
    const userId = await ctx.db.insert('users', {
      address: args.address,
      username: '',
      avatarUrl: '',
      bio: '',
      updatedAt: creationTime.getTime(),
    });

    return await ctx.db.get(userId);
  },
});
