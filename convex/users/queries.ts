/**
 * Users Queries Module
 * 
 * Handles user retrieval operations
 * Split from convex/users.ts for better maintainability
 */

import { v } from "convex/values";
import { query } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

const SUPERADMIN_EMAIL = "romangulanyan@gmail.com";

// ─── USER QUERIES ────────────────────────────────────────────────────────────

/** Get all users scoped to caller's organization */
export const getAllUsers = query({
  args: { requesterId: v.id("users") },
  handler: async (ctx, { requesterId }) => {
    const requester = await ctx.db.get(requesterId);
    if (!requester) throw new Error("Requester not found");

    // Superadmin sees all users across all orgs
    if (requester.email.toLowerCase() === SUPERADMIN_EMAIL) {
      return await ctx.db.query("users").collect();
    }

    // Everyone else only sees their organization
    if (!requester.organizationId) {
      throw new Error("User does not belong to an organization");
    }

    return await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("organizationId", requester.organizationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/** Get users by organization ID */
export const getUsersByOrganization = query({
  args: {
    requesterId: v.id("users"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, { requesterId, organizationId }) => {
    const requester = await ctx.db.get(requesterId);
    if (!requester) throw new Error("Requester not found");

    const isSuperadmin = requester.email.toLowerCase() === SUPERADMIN_EMAIL;
    if (!isSuperadmin && requester.organizationId !== organizationId) {
      throw new Error("Access denied: cross-organization access is not allowed");
    }

    return await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/** Get current user for client-side auth state */
export const getCurrentUser = query({
  args: {
    email: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { email, userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    const userEmail = identity?.email || email;

    if (userId) {
      return await ctx.db.get(userId);
    }

    if (!userEmail) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", userEmail.toLowerCase()))
      .first();
  },
});

/** Get user by ID */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

/** Search users by name or email */
export const searchUsers = query({
  args: {
    query: v.string(),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, { query, organizationId }) => {
    const allUsers = await ctx.db.query("users").collect();
    const queryLower = query.toLowerCase();

    return allUsers
      .filter((user) => {
        if (organizationId && user.organizationId !== organizationId) return false;
        if (!user.isActive || !user.isApproved) return false;
        return (
          user.name.toLowerCase().includes(queryLower) ||
          user.email.toLowerCase().includes(queryLower) ||
          user.position?.toLowerCase().includes(queryLower)
        );
      })
      .slice(0, 50);
  },
});

/** Get supervisors list */
export const getSupervisors = query({
  args: { requesterId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let supervisors = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "supervisor"))
      .collect();
    let admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    if (args.requesterId) {
      const requester = await ctx.db.get(args.requesterId);
      if (requester && requester.organizationId) {
        supervisors = supervisors.filter((u) => u.organizationId === requester.organizationId);
        admins = admins.filter((u) => u.organizationId === requester.organizationId);
      }
    }

    return [...supervisors, ...admins]
      .filter((u) => u.isActive && u.isApproved)
      .map((u) => ({
        _id: u._id,
        name: u.name,
        role: u.role,
        position: u.position,
        department: u.department,
        avatarUrl: u.avatarUrl ?? u.faceImageUrl,
      }));
  },
});

/** Get employees under supervisor */
export const getMyEmployees = query({
  args: { supervisorId: v.id("users") },
  handler: async (ctx, args) => {
    const employees = await ctx.db
      .query("users")
      .withIndex("by_supervisor", (q) => q.eq("supervisorId", args.supervisorId))
      .collect();
    return employees.map((e) => ({
      ...e,
      avatarUrl: e.avatarUrl ?? e.faceImageUrl,
    }));
  },
});

/** Get all users for assignment */
export const getUsersForAssignment = query({
  args: { requesterId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").collect();

    if (args.requesterId) {
      const requester = await ctx.db.get(args.requesterId);
      if (requester && requester.organizationId) {
        users = users.filter((u) => u.organizationId === requester.organizationId);
      }
    }

    return users
      .filter((u) =>
        u.isActive !== false &&
        u.isApproved !== false &&
        (u.role === "employee" || u.role === "supervisor" || u.role === "admin" || u.role === "driver")
      )
      .map((u) => ({
        _id: u._id,
        name: u.name,
        position: u.position,
        department: u.department,
        avatarUrl: u.avatarUrl ?? u.faceImageUrl,
        supervisorId: u.supervisorId,
        role: u.role,
      }));
  },
});

/** Get pending users (awaiting approval) */
export const getPendingUsers = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, { organizationId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_org_approval", (q) =>
        q.eq("organizationId", organizationId).eq("isApproved", false)
      )
      .collect();
  },
});

/** Get user count for organization */
export const getUserCount = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, { organizationId }) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .collect();
    return {
      total: users.length,
      active: users.filter((u) => u.isActive && u.isApproved).length,
      pending: users.filter((u) => !u.isApproved).length,
    };
  },
});
