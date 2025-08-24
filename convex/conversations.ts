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

/**
 * Retrieves all conversations for the currently authenticated user.
 *
 * It fetches the user's conversations and, for each conversation,
 * retrieves the details of the other participant.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} args.address - The address of the user.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of conversations with participant details.
 */
export const list = query({
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

    // TODO: This is inefficient and should be refactored to use a proper relational model.
    // This is a temporary solution to get the feature working.
    // This might cause performance issues as the number of conversations grows.
    const allConversations = await ctx.db.query('conversations').collect();

    const userConversations = allConversations.filter((conversation) =>
      conversation.participants.includes(user._id),
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
      }),
    );

    return conversationsWithParticipantDetails.filter(Boolean);
  },
});

/**
 * Retrieves a single conversation with the details of the other participant.
 *
 * @param {object} args - The arguments for the query.
 * @param {string} args.conversationId - The ID of the conversation to retrieve.
 * @param {string} args.address - The address of the user.
 * @returns {Promise<object|null>} A promise that resolves to the conversation with participant details, or null if not found.
 */
export const get = query({
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
