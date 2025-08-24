import { defineTable, paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const messages = defineTable({
  conversationId: v.id('conversations'),
  authorId: v.id('users'),
  body: v.string(),
  updatedAt: v.optional(v.number()),
}).index('by_conversation', ['conversationId']);

export const sendMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    body: v.string(),
    authorAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_address', (q) => q.eq('address', args.authorAddress))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    const { conversationId, body } = args;

    await ctx.db.insert('messages', {
      conversationId,
      body,
      authorId: user._id,
    });
  },
});

export const updateMessage = mutation({
  args: {
    messageId: v.id('messages'),
    body: v.string(),
    authorAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_address', (q) => q.eq('address', args.authorAddress))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.authorId !== user._id) {
      throw new Error('Not authorized to edit this message');
    }

    await ctx.db.patch(args.messageId, {
      body: args.body,
      updatedAt: Date.now(),
    });
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id('messages'),
    authorAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_address', (q) => q.eq('address', args.authorAddress))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.authorId !== user._id) {
      throw new Error('Not authorized to delete this message');
    }

    await ctx.db.delete(args.messageId);
  },
});

export const listMessages = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .collect();

    return messages;
  },
});

export const listMessagesPaginated = query({
  args: {
    conversationId: v.id('conversations'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .order('desc')
      .paginate(args.paginationOpts);
  },
});