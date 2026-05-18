import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const newsletter = {
  newsletterSubscribers: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    language: v.union(v.literal('en'), v.literal('ru'), v.literal('hy'), v.literal('deu')),
    topics: v.optional(
      v.array(
        v.union(
          v.literal('hr-tips'),
          v.literal('leadership'),
          v.literal('wellness'),
          v.literal('tech'),
        ),
      ),
    ),
    subscribedAt: v.number(),
    unsubscribed: v.boolean(),
    unsubscribeToken: v.string(),
    lastSentAt: v.optional(v.number()),
    // Telegram delivery
    telegramChatId: v.optional(v.string()),
    channel: v.optional(v.union(v.literal('email'), v.literal('telegram'))),
  })
    .index('by_email', ['email'])
    .index('by_active', ['unsubscribed'])
    .index('by_token', ['unsubscribeToken'])
    .index('by_telegram', ['telegramChatId']),
};
