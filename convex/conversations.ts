import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const conversations = defineTable({
  participants: v.array(v.id('users')),
}).index('by_participants', ['participants']);

export const createOrGetConversation = mutation({
  args: { participants: v.array(v.id('users')) },
  handler: async (ctx, args) => {
    const { participants } = args;

    const existingConversation = await ctx.db
      .query('conversations')
      .withIndex('by_participants', (q) => q.eq('participants', participants))
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    const conversationId = await ctx.db.insert('conversations', {
      participants,
    });

    return conversationId;
  },
});

export const getConversations = query({
  args: { address: v.string() },
  handler: async (ctx, args) => {
    if (!args.address) {
      return [];
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_address', (q) => q.eq('address', args.address))
      .unique();

    if (!user) {
      return [];
    }

    const conversations = await ctx.db
      .query('conversations')
      .filter((q) => q.eq(q.field('participants'), [user._id]))
      .collect();

    return conversations;
  },
});

export const getConversationsWithParticipantDetails = query({
  args: { address: v.string() },
  handler: async (ctx, args) => {
    if (!args.address) {
      return [];
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_address', (q) => q.eq('address', args.address))
      .unique();

    if (!user) {
      return [];
    }

    const conversations = await ctx.db.query('conversations').collect();

    const userConversations = conversations.filter((conversation) =>
      conversation.participants.includes(user._id)
    );

    const conversationsWithParticipantDetails = await Promise.all(
      userConversations.map(async (conversation) => {
        const participantId = conversation.participants.find((id) => id !== user._id);

        if (!participantId) {
          return null;
        }

        const participant = await ctx.db.get(participantId);

        return {
          ...conversation,
          participant,
        };
      })
    );

    return conversationsWithParticipantDetails.filter(Boolean);
  },
});

export const getConversationWithParticipantDetails = query({
  args: { conversationId: v.id('conversations'), address: v.string() },
  handler: async (ctx, args) => {
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

    const participantId = conversation.participants.find((id) => id !== user._id);

    if (!participantId) {
      return null;
    }

    const participant = await ctx.db.get(participantId);

    return {
      ...conversation,
      participant,
    };
  },
});
