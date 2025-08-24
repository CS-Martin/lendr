import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { ConvexError } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';

export const conversations = defineTable({});

export const createOrGetConversation = mutation({
  args: {
    otherParticipantId: v.id('users'),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const { otherParticipantId, address } = args;

    if (!address) {
      throw new ConvexError('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_address', (q) => q.eq('address', address))
      .unique();

    if (!user) {
      throw new ConvexError('User not found');
    }

    const existingConversations = await ctx.db
      .query('userConversations')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    for (const userConversation of existingConversations) {
      const conversation = await ctx.db.get(userConversation.conversationId);
      if (conversation) {
        const otherParticipants = await ctx.db
          .query('userConversations')
          .withIndex('by_conversationId', (q) => q.eq('conversationId', conversation._id))
          .filter((q) => q.neq(q.field('userId'), user._id))
          .collect();
        if (otherParticipants.some((p) => p.userId === otherParticipantId)) {
          return conversation._id;
        }
      }
    }

    const conversationId = await ctx.db.insert('conversations', {});

    await ctx.db.insert('userConversations', {
      userId: user._id,
      conversationId,
    });

    await ctx.db.insert('userConversations', {
      userId: otherParticipantId,
      conversationId,
    });

    return conversationId;
  },
});

export const list = query({
  args: {
    address: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_address', (q) => q.eq('address', args.address))
      .unique();

    if (!user) {
      throw new ConvexError('User not found');
    }

    const paginatedUserConversations = await ctx.db
      .query('userConversations')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .order('desc')
      .paginate(args.paginationOpts);

    const conversations = await Promise.all(
      paginatedUserConversations.page.map(async (userConversation) => {
        const conversation = await ctx.db.get(userConversation.conversationId);
        if (!conversation) {
          return null;
        }

        const otherParticipant = await ctx.db
          .query('userConversations')
          .withIndex('by_conversationId', (q) =>
            q.eq('conversationId', userConversation.conversationId)
          )
          .filter((q) => q.neq(q.field('userId'), user._id))
          .first();

        if (!otherParticipant) {
          return null;
        }

        const participantDetails = await ctx.db.get(otherParticipant.userId);

        return {
          ...conversation,
          participant: participantDetails,
        };
      })
    );

    return {
      page: conversations.filter(Boolean),
      isDone: paginatedUserConversations.isDone,
      continueCursor: paginatedUserConversations.continueCursor,
    };
  },
});

export const get = query({
  args: {
    conversationId: v.id('conversations'),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.address) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_address', (q) => q.eq('address', args.address))
      .unique();

    if (!user) {
      return null;
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }

    const otherParticipant = await ctx.db
      .query('userConversations')
      .withIndex('by_conversationId', (q) => q.eq('conversationId', args.conversationId))
      .filter((q) => q.neq(q.field('userId'), user._id))
      .first();

    if (!otherParticipant) {
      return null;
    }

    const participantDetails = await ctx.db.get(otherParticipant.userId);

    return {
      ...conversation,
      participant: participantDetails,
    };
  },
});
