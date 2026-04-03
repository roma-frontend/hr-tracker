import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const ai = {
  aiConversations: defineTable({
    userId: v.id('users'),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  aiMessages: defineTable({
    conversationId: v.id('aiConversations'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    createdAt: v.number(),
  }).index('by_conversation', ['conversationId']),
};
