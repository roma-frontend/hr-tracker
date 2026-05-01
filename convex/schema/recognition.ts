import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const recognition = {
  kudos: defineTable({
    organizationId: v.id('organizations'),
    senderId: v.id('users'),
    receiverId: v.id('users'),
    category: v.union(
      v.literal('teamwork'),
      v.literal('innovation'),
      v.literal('leadership'),
      v.literal('dedication'),
      v.literal('customer_focus'),
      v.literal('mentorship'),
      v.literal('excellence'),
      v.literal('above_and_beyond'),
    ),
    message: v.string(),
    isPublic: v.boolean(),
    pointsCost: v.number(),
    reactions: v.optional(
      v.array(
        v.object({
          userId: v.id('users'),
          emoji: v.string(),
          createdAt: v.number(),
        }),
      ),
    ),
    createdAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_org_created', ['organizationId', 'createdAt'])
    .index('by_receiver', ['receiverId'])
    .index('by_sender', ['senderId'])
    .index('by_org_receiver', ['organizationId', 'receiverId'])
    .index('by_org_sender', ['organizationId', 'senderId']),

  kudosBadges: defineTable({
    organizationId: v.id('organizations'),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    criteria: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_org_active', ['organizationId', 'isActive']),

  kudosBadgeAwards: defineTable({
    organizationId: v.id('organizations'),
    badgeId: v.id('kudosBadges'),
    userId: v.id('users'),
    awardedBy: v.id('users'),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_user', ['userId'])
    .index('by_org_user', ['organizationId', 'userId'])
    .index('by_badge', ['badgeId']),

  // Points balance per user
  userPoints: defineTable({
    organizationId: v.id('organizations'),
    userId: v.id('users'),
    balance: v.number(),
    totalEarned: v.number(),
    totalSpent: v.number(),
    updatedAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_user', ['userId'])
    .index('by_org_user', ['organizationId', 'userId']),

  // Transaction history for points
  pointTransactions: defineTable({
    organizationId: v.id('organizations'),
    userId: v.id('users'),
    amount: v.number(),
    type: v.union(
      v.literal('earned_attendance'),
      v.literal('earned_review'),
      v.literal('earned_manual'),
      v.literal('spent_kudos'),
    ),
    description: v.string(),
    referenceId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_user', ['userId'])
    .index('by_org_user', ['organizationId', 'userId'])
    .index('by_org_user_created', ['organizationId', 'userId', 'createdAt'])
    .index('by_type', ['type']),
};
