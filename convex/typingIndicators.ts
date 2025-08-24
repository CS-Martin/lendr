import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const typingIndicators = defineTable({
  conversationId: v.id('conversations'),
  userId: v.id('users'),
  updated: v.number(),
})
  .index('by_conversation_user', ['conversationId', 'userId'])
  .index('by_updated', ['updated'])
  .index('by_conversation_updated', ['conversationId', 'updated']);
