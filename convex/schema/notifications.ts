import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const notifications = {
  notifications: defineTable({
    organizationId: v.optional(v.id('organizations')),
    userId: v.id('users'),
    type: v.union(
      v.literal('leave_request'),
      v.literal('leave_approved'),
      v.literal('leave_rejected'),
      v.literal('driver_request'),
      v.literal('driver_request_approved'),
      v.literal('driver_request_rejected'),
      v.literal('employee_added'),
      v.literal('join_request'),
      v.literal('join_approved'),
      v.literal('join_rejected'),
      v.literal('security_alert'),
      v.literal('status_change'),
      v.literal('message_mention'),
      v.literal('system'),
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedId: v.optional(v.string()),
    metadata: v.optional(v.string()),
    route: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_org', ['organizationId'])
    .index('by_user_unread', ['userId', 'isRead'])
    .index('by_unread_date', ['userId', 'isRead', 'createdAt'])
    .index('by_org_created', ['organizationId', 'createdAt']),
};
