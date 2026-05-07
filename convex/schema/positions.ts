import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const positions = {
  positions: defineTable({
    organizationId: v.id('organizations'),
    departmentId: v.optional(v.id('departments')),
    title: v.string(),
    titleEn: v.optional(v.string()),
    titleRu: v.optional(v.string()),
    titleHy: v.optional(v.string()),
    description: v.optional(v.string()),
    level: v.optional(v.string()),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_department', ['departmentId']),
};
