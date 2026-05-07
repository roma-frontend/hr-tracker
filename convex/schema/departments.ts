import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const departments = {
  departments: defineTable({
    organizationId: v.id('organizations'),
    name: v.string(),
    nameEn: v.optional(v.string()),
    nameRu: v.optional(v.string()),
    nameHy: v.optional(v.string()),
    description: v.optional(v.string()),
    managerId: v.optional(v.id('users')),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_manager', ['managerId']),
};
