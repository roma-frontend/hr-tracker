import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Get Employee Profile with Extended Data ──────────────────────────────────
export const getEmployeeProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get profile data
    const profile = await ctx.db
      .query("employeeProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Get documents
    const documents = await ctx.db
      .query("employeeDocuments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get performance metrics
    const metrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(1);

    return {
      user,
      profile,
      documents,
      metrics: metrics[0] ?? null,
    };
  },
});

// ── Update Employee Biography ──────────────────────────────────────────────
export const updateBiography = mutation({
  args: {
    userId: v.id("users"),
    biography: v.object({
      education: v.optional(v.array(v.string())),
      certifications: v.optional(v.array(v.string())),
      workHistory: v.optional(v.array(v.string())),
      skills: v.optional(v.array(v.string())),
      languages: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("employeeProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        biography: args.biography,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("employeeProfiles", {
        userId: args.userId,
        biography: args.biography,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// ── Upload Employee Document ──────────────────────────────────────────────
export const uploadDocument = mutation({
  args: {
    userId: v.id("users"),
    uploaderId: v.id("users"),
    category: v.union(
      v.literal("resume"),
      v.literal("contract"),
      v.literal("certificate"),
      v.literal("performance_review"),
      v.literal("id_document"),
      v.literal("other")
    ),
    fileName: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("employeeDocuments", {
      userId: args.userId,
      uploaderId: args.uploaderId,
      category: args.category,
      fileName: args.fileName,
      fileUrl: args.fileUrl,
      fileSize: args.fileSize,
      description: args.description,
      uploadedAt: Date.now(),
    });
  },
});

// ── Get Employee Documents ──────────────────────────────────────────────
export const getDocuments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("employeeDocuments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// ── Delete Document ──────────────────────────────────────────────
export const deleteDocument = mutation({
  args: { documentId: v.id("employeeDocuments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.documentId);
  },
});

// ── Update Performance Metrics ──────────────────────────────────────────────
export const updatePerformanceMetrics = mutation({
  args: {
    userId: v.id("users"),
    updatedBy: v.id("users"),
    metrics: v.object({
      punctualityScore: v.number(),
      absenceRate: v.number(),
      lateArrivals: v.number(),
      kpiScore: v.number(),
      projectCompletion: v.number(),
      deadlineAdherence: v.number(),
      teamworkRating: v.number(),
      communicationScore: v.number(),
      conflictIncidents: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("performanceMetrics", {
      userId: args.userId,
      updatedBy: args.updatedBy,
      ...args.metrics,
      createdAt: Date.now(),
    });
  },
});

// ── Get Performance History ──────────────────────────────────────────────
export const getPerformanceHistory = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 12;
    return await ctx.db
      .query("performanceMetrics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});
