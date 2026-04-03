import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const conflicts = {
  leaveConflictAlerts: defineTable({
    organizationId: v.id('organizations'),
    leaveRequestId: v.id('leaveRequests'),
    eventId: v.id('companyEvents'),
    userId: v.id('users'),
    department: v.string(),
    conflictType: v.union(v.literal('required_department'), v.literal('required_employee')),
    severity: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
    isReviewed: v.boolean(),
    reviewNotes: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_leave_request', ['leaveRequestId'])
    .index('by_event', ['eventId'])
    .index('by_user', ['userId'])
    .index('by_is_reviewed', ['isReviewed']),
};
