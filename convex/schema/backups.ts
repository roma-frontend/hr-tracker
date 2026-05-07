import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const backups = {
  employeeBackups: defineTable({
    organizationId: v.id('organizations'),
    userId: v.id('users'),
    userEmail: v.string(),
    userName: v.string(),
    snapshot: v.string(), // JSON string of all employee data
    snapshotSize: v.number(), // bytes
    createdAt: v.number(),
    expiresAt: v.number(), // auto-cleanup timestamp
  })
    .index('by_org', ['organizationId'])
    .index('by_user', ['userId'])
    .index('by_org_user', ['organizationId', 'userId'])
    .index('by_org_created', ['organizationId', 'createdAt'])
    .index('by_expires', ['expiresAt']),
};
