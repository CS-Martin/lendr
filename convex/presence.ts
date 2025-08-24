import { defineTable } from 'convex/server';
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const presence = defineTable({
  user: v.string(), // user address
  updated: v.number(),
}).index('by_user', ['user']);

export const typingIndicators = defineTable({
  conversationId: v.id('conversations'),
  userId: v.id('users'),
  updated: v.number(),
})
  .index('by_conversation_user', ['conversationId', 'userId'])
  .index('by_conversation_updated', ['conversationId', 'updated']);

// --- Mutations ---

export const heartbeat = mutation({
  args: { address: v.string() },
  handler: async (ctx, { address }) => {
    const existing = await ctx.db
      .query('presence')
      .withIndex('by_user', (q) => q.eq('user', address))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { updated: Date.now() });
    } else {
      await ctx.db.insert('presence', {
        user: address,
        updated: Date.now(),
      });
    }
  },
});

export const updateTypingStatus = mutation({
  args: {
    conversationId: v.id('conversations'),
    address: v.string(),
  },
  handler: async (ctx, { conversationId, address }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_address', (q) => q.eq('address', address))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    const existing = await ctx.db
      .query('typingIndicators')
      .withIndex('by_conversation_user', (q) => q.eq('conversationId', conversationId).eq('userId', user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { updated: Date.now() });
    } else {
      await ctx.db.insert('typingIndicators', {
        conversationId,
        userId: user._id,
        updated: Date.now(),
      });
    }
  },
});

// --- Queries ---

export const listOnlineUsers = query(async (ctx) => {
  const now = Date.now();
  const twoMinutesAgo = now - 2 * 60 * 1000; // 2 minutes in milliseconds

  const online = await ctx.db
    .query('presence')
    .filter((q) => q.gt(q.field('updated'), twoMinutesAgo))
    .collect();

  return online.map((p) => p.user);
});

export const getTypingStatus = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, { conversationId }) => {
    const now = Date.now();
    const tenSecondsAgo = now - 10 * 1000; // 10 seconds

    const typing = await ctx.db
      .query('typingIndicators')
      .withIndex('by_conversation_updated', (q) => q.eq('conversationId', conversationId).gt('updated', tenSecondsAgo))
      .collect();

    return typing.map((t) => t.userId);
  },
});
