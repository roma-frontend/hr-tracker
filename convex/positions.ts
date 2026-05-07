import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import type { Id } from './_generated/dataModel';

export const list = query({
  args: {
    organizationId: v.optional(v.id('organizations')),
    departmentId: v.optional(v.id('departments')),
  },
  handler: async (ctx, args) => {
    const orgId = args.organizationId;

    let positions;
    if (args.departmentId) {
      positions = await ctx.db
        .query('positions')
        .withIndex('by_department', (q: any) => q.eq('departmentId', args.departmentId))
        .collect();
    } else if (orgId) {
      positions = await ctx.db
        .query('positions')
        .withIndex('by_org', (q: any) => q.eq('organizationId', orgId))
        .collect();
    } else {
      positions = await ctx.db.query('positions').collect();
    }

    const users = await ctx.db.query('users').collect();

    return positions.map((pos: any) => {
      const employeeCount = users.filter(
        (u: any) => u.positionId === pos._id && (orgId ? u.organizationId === orgId : true),
      ).length;

      return {
        ...pos,
        employeeCount,
      };
    });
  },
});

export const getById = query({
  args: { id: v.id('positions') },
  handler: async (ctx: any, args: any) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    organizationId: v.id('organizations'),
    departmentId: v.optional(v.id('departments')),
    title: v.string(),
    description: v.optional(v.string()),
    level: v.optional(v.string()),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const now = Date.now();
    return await ctx.db.insert('positions', {
      organizationId: args.organizationId,
      departmentId: args.departmentId,
      title: args.title,
      description: args.description,
      level: args.level,
      salaryMin: args.salaryMin,
      salaryMax: args.salaryMax,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('positions'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    departmentId: v.optional(v.id('departments')),
    level: v.optional(v.string()),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx: any, args: any) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id('positions') },
  handler: async (ctx: any, args: any) => {
    await ctx.db.delete(args.id);
  },
});
