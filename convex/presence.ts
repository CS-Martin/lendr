import { defineTable } from 'convex/server';
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const presence = defineTable({
  user: v.string(), // user address
  updated: v.number(),
}).index('by_user', ['user']);

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
