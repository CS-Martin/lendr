import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const userConversations = defineTable({
  userId: v.id('users'),
  conversationId: v.id('conversations'),
})
  .index('by_conversationId', ['conversationId'])
  .index('by_userId', ['userId']);
