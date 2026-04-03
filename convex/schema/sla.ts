import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const sla = {
  slaConfig: defineTable({
    organizationId: v.optional(v.id('organizations')),
    targetResponseTime: v.number(),
    warningThreshold: v.number(),
    criticalThreshold: v.number(),
    businessHoursOnly: v.boolean(),
    businessStartHour: v.number(),
    businessEndHour: v.number(),
    excludeWeekends: v.boolean(),
    notifyOnWarning: v.boolean(),
    notifyOnCritical: v.boolean(),
    notifyOnBreach: v.boolean(),
    updatedBy: v.id('users'),
    updatedAt: v.number(),
  }).index('by_org', ['organizationId']),

  slaMetrics: defineTable({
    organizationId: v.optional(v.id('organizations')),
    leaveRequestId: v.id('leaveRequests'),
    submittedAt: v.number(),
    respondedAt: v.optional(v.number()),
    responseTimeHours: v.optional(v.number()),
    targetResponseTime: v.number(),
    status: v.union(v.literal('pending'), v.literal('on_time'), v.literal('breached')),
    slaScore: v.optional(v.number()),
    warningTriggered: v.boolean(),
    criticalTriggered: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_leave', ['leaveRequestId'])
    .index('by_status', ['status'])
    .index('by_submitted', ['submittedAt']),
};
