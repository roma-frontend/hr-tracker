/**
 * Users Mutations Module
 *
 * Handles user create, update, delete operations
 * Split from convex/users.ts for better maintainability
 */

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { isSuperadminEmail } from "../lib/auth";

// ─── USER MUTATIONS ──────────────────────────────────────────────────────────

/** Create OAuth user for Google sign-in */
export const createOAuthUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    googleId: v.string(),
  },
  handler: async (ctx, args) => {
    const emailLower = args.email.toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", emailLower))
      .first();

    if (existing) {
      if (existing.googleId !== args.googleId) {
        await ctx.db.patch(existing._id, { googleId: args.googleId });
      }
      if (args.avatarUrl && existing.avatarUrl !== args.avatarUrl) {
        await ctx.db.patch(existing._id, { avatarUrl: args.avatarUrl });
      }
      if (existing.name !== args.name) {
        await ctx.db.patch(existing._id, { name: args.name });
      }
      return existing._id;
    }

    const isSuperAdmin = isSuperadminEmail(emailLower);
    const userId = await ctx.db.insert("users", {
      organizationId: undefined,
      name: args.name,
      email: emailLower,
      passwordHash: "",
      googleId: args.googleId,
      role: isSuperAdmin ? "superadmin" : "employee",
      employeeType: "staff",
      isActive: true,
      isApproved: isSuperAdmin,
      travelAllowance: 20000,
      paidLeaveBalance: 24,
      sickLeaveBalance: 10,
      familyLeaveBalance: 5,
      avatarUrl: args.avatarUrl,
      createdAt: Date.now(),
    });

    return userId;
  },
});

/** Create user (admin only) */
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    role: v.optional(v.union(
      v.literal("employee"),
      v.literal("supervisor"),
      v.literal("admin"),
      v.literal("driver")
    )),
    employeeType: v.optional(v.union(v.literal("staff"), v.literal("contractor"))),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    phone: v.optional(v.string()),
    supervisorId: v.optional(v.id("users")),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      organizationId: args.organizationId,
      name: args.name,
      email: args.email.toLowerCase(),
      passwordHash: args.passwordHash,
      role: args.role || "employee",
      employeeType: args.employeeType || "staff",
      department: args.department,
      position: args.position,
      phone: args.phone,
      supervisorId: args.supervisorId,
      isActive: true,
      isApproved: true,
      travelAllowance: 20000,
      paidLeaveBalance: 24,
      sickLeaveBalance: 10,
      familyLeaveBalance: 5,
      createdAt: Date.now(),
    });

    return userId;
  },
});