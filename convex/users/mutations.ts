/**
 * Users Mutations Module
 * 
 * Handles user create, update, delete operations
 * Split from convex/users.ts for better maintainability
 */

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

const SUPERADMIN_EMAIL = "romangulanyan@gmail.com";

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

    const isSuperAdmin = emailLower === SUPERADMIN_EMAIL;
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
    const admin = await ctx.db.get(args.organizationId).then(() => null); // Placeholder for admin check

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
      travelAllowance: args.employeeType === "contractor" ? 12000 : 20000,
      paidLeaveBalance: 24,
      sickLeaveBalance: 10,
      familyLeaveBalance: 5,
      createdAt: Date.now(),
    });

    return userId;
  },
});

/** Update user */
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    requesterId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    position: v.optional(v.string()),
    department: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    presenceStatus: v.optional(v.union(
      v.literal("available"),
      v.literal("in_meeting"),
      v.literal("in_call"),
      v.literal("out_of_office"),
      v.literal("busy")
    )),
    supervisorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { userId, requesterId, ...updates } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const requester = await ctx.db.get(requesterId);
    if (!requester) throw new Error("Requester not found");

    const isAdmin = requester.role === "admin" || requester.role === "superadmin";
    const isSelf = userId === requesterId;

    if (!isAdmin && !isSelf) {
      throw new Error("Not authorized");
    }

    if (args.email && args.email !== user.email) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email!.toLowerCase()))
        .first();
      if (existing && existing._id !== userId) {
        throw new Error("Email already in use");
      }
      updates.email = args.email.toLowerCase();
    }

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return userId;
  },
});

/** Delete user (soft delete) */
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
    requesterId: v.id("users"),
  },
  handler: async (ctx, { userId, requesterId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const requester = await ctx.db.get(requesterId);
    if (!requester) throw new Error("Requester not found");

    const isAdmin = requester.role === "admin" || requester.role === "superadmin";
    if (!isAdmin) throw new Error("Only admins can delete users");

    await ctx.db.patch(userId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return userId;
  },
});

/** Approve user (admin only) */
export const approveUser = mutation({
  args: {
    userId: v.id("users"),
    adminId: v.id("users"),
  },
  handler: async (ctx, { userId, adminId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const admin = await ctx.db.get(adminId);
    if (!admin) throw new Error("Admin not found");
    if (admin.role !== "admin" && admin.role !== "superadmin") {
      throw new Error("Only admins can approve users");
    }

    await ctx.db.patch(userId, {
      isApproved: true,
      approvedBy: adminId,
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      organizationId: user.organizationId,
      userId,
      type: "employee_added",
      title: "✅ Account Approved!",
      message: `Your account has been approved. Welcome to ${user.organizationId ? "the organization" : "the team"}!`,
      isRead: false,
      createdAt: Date.now(),
    });

    return userId;
  },
});

/** Reject user (admin only) */
export const rejectUser = mutation({
  args: {
    userId: v.id("users"),
    adminId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { userId, adminId, reason }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const admin = await ctx.db.get(adminId);
    if (!admin) throw new Error("Admin not found");

    await ctx.db.patch(userId, {
      isApproved: false,
      isActive: false,
      updatedAt: Date.now(),
    });

    if (reason) {
      await ctx.db.insert("notifications", {
        organizationId: user.organizationId,
        userId,
        type: "system",
        title: "❌ Account Rejected",
        message: `Your account was rejected. Reason: ${reason}`,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return userId;
  },
});

/** Assign supervisor to employee */
export const assignSupervisor = mutation({
  args: {
    employeeId: v.id("users"),
    supervisorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.employeeId, {
      supervisorId: args.supervisorId,
    });
  },
});

/** Update user presence status */
export const updatePresenceStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("available"),
      v.literal("in_meeting"),
      v.literal("in_call"),
      v.literal("out_of_office"),
      v.literal("busy")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      presenceStatus: args.status,
      updatedAt: Date.now(),
    });
  },
});
