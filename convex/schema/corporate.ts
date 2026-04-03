import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const corporate = {
  sharepointSyncLogs: defineTable({
    organizationId: v.id('organizations'),
    triggeredBy: v.id('users'),
    created: v.number(),
    updated: v.number(),
    deactivated: v.number(),
    errors: v.number(),
    syncedAt: v.number(),
  }).index('by_org', ['organizationId']),

  aiSiteEditorSessions: defineTable({
    organizationId: v.id('organizations'),
    userId: v.id('users'),
    plan: v.union(v.literal('starter'), v.literal('professional'), v.literal('enterprise')),
    userMessage: v.string(),
    aiResponse: v.string(),
    editType: v.union(
      v.literal('design'),
      v.literal('content'),
      v.literal('layout'),
      v.literal('logic'),
      v.literal('full_control'),
    ),
    targetComponent: v.optional(v.string()),
    changesMade: v.array(
      v.object({
        file: v.string(),
        type: v.string(),
        description: v.string(),
        before: v.optional(v.string()),
        after: v.optional(v.string()),
      }),
    ),
    limitType: v.union(v.literal('limited'), v.literal('unlimited')),
    tokensUsed: v.optional(v.number()),
    status: v.union(
      v.literal('pending'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('rejected'),
    ),
    errorMessage: v.optional(v.string()),
    canRollback: v.boolean(),
    rolledBack: v.boolean(),
    rolledBackAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_user', ['userId'])
    .index('by_org_date', ['organizationId', 'createdAt'])
    .index('by_plan', ['plan'])
    .index('by_status', ['status']),

  aiSiteEditorUsage: defineTable({
    organizationId: v.id('organizations'),
    userId: v.id('users'),
    plan: v.union(v.literal('starter'), v.literal('professional'), v.literal('enterprise')),
    month: v.string(),
    designChanges: v.number(),
    contentChanges: v.number(),
    layoutChanges: v.number(),
    logicChanges: v.number(),
    fullControlChanges: v.number(),
    totalRequests: v.number(),
    lastResetAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_user', ['userId'])
    .index('by_org_month', ['organizationId', 'month'])
    .index('by_user_month', ['userId', 'month']),
};
