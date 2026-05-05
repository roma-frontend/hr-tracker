import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const documents = {
  documents: defineTable({
    organizationId: v.id('organizations'),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal('policy'),
      v.literal('contract'),
      v.literal('report'),
      v.literal('template'),
      v.literal('form'),
      v.literal('certificate'),
      v.literal('other'),
    ),
    fileUrl: v.string(),
    fileName: v.string(),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    uploadedBy: v.id('users'),
    isPublished: v.optional(v.boolean()),
    isMandatory: v.optional(v.boolean()),
    expiresAt: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_org_published', ['organizationId', 'isPublished'])
    .index('by_uploader', ['organizationId', 'uploadedBy'])
    .index('by_category', ['organizationId', 'category']),

  documentViews: defineTable({
    organizationId: v.id('organizations'),
    documentId: v.id('documents'),
    userId: v.id('users'),
    viewedAt: v.number(),
    acknowledged: v.optional(v.boolean()),
  })
    .index('by_document', ['organizationId', 'documentId'])
    .index('by_user', ['organizationId', 'userId'])
    .index('by_user_document', ['organizationId', 'userId', 'documentId']),

  documentCategories: defineTable({
    organizationId: v.id('organizations'),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_org', ['organizationId']),
};
