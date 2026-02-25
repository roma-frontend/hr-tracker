import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Get all users (admin/supervisor only) ──────────────────────────────────
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// ── Get user by email ──────────────────────────────────────────────────────
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

// ── Get user by ID ─────────────────────────────────────────────────────────
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

// ── Seed admin user (romangulanyan@gmail.com) ──────────────────────────────
export const seedAdmin = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, { name, email, passwordHash }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      name,
      email,
      passwordHash,
      role: "admin",
      employeeType: "staff",
      department: "Management",
      position: "Administrator",
      isActive: true,
      isApproved: true,
      approvedAt: Date.now(),
      travelAllowance: 20000,
      paidLeaveBalance: 24,
      sickLeaveBalance: 10,
      familyLeaveBalance: 5,
      createdAt: Date.now(),
    });
  },
});

// ── Create user (admin only) ───────────────────────────────────────────────
const ADMIN_EMAIL = "romangulanyan@gmail.com";

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("supervisor"), v.literal("employee")),
    employeeType: v.union(v.literal("staff"), v.literal("contractor")),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    phone: v.optional(v.string()),
    supervisorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // ONLY romangulanyan@gmail.com can be admin
    if (args.role === "admin" && args.email.toLowerCase() !== ADMIN_EMAIL) {
      throw new Error("Cannot assign admin role to this email address");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) throw new Error("User with this email already exists");

    const isContractor = args.email.toLowerCase().includes("contractor") || args.employeeType === "contractor";
    const travelAllowance = isContractor ? 12000 : 20000;

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: args.passwordHash,
      role: args.role,
      employeeType: isContractor ? "contractor" : "staff",
      department: args.department,
      position: args.position,
      phone: args.phone,
      supervisorId: args.supervisorId,
      isActive: true,
      isApproved: true, // Admin-created users are auto-approved
      approvedAt: Date.now(),
      travelAllowance,
      paidLeaveBalance: 24,
      sickLeaveBalance: 10,
      familyLeaveBalance: 5,
      createdAt: Date.now(),
    });

    // Notify admins
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        type: "employee_added",
        title: "New Employee Added",
        message: `${args.name} (${args.role}) has been added to the system.`,
        isRead: false,
        relatedId: userId,
        createdAt: Date.now(),
      });
    }

    return userId;
  },
});

// ── Update user ────────────────────────────────────────────────────────────
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("supervisor"), v.literal("employee"))),
    employeeType: v.optional(v.union(v.literal("staff"), v.literal("contractor"))),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    supervisorId: v.optional(v.id("users")),
    isActive: v.optional(v.boolean()),
    paidLeaveBalance: v.optional(v.number()),
    sickLeaveBalance: v.optional(v.number()),
    familyLeaveBalance: v.optional(v.number()),
  },
  handler: async (ctx, { userId, ...updates }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // ONLY romangulanyan@gmail.com can have admin role
    if (updates.role === "admin" && user.email.toLowerCase() !== ADMIN_EMAIL) {
      throw new Error("Cannot assign admin role: only romangulanyan@gmail.com can be admin");
    }

    // Prevent removing admin role from romangulanyan@gmail.com
    if (user.email.toLowerCase() === ADMIN_EMAIL && updates.role && updates.role !== "admin") {
      throw new Error("Cannot change role of the admin account");
    }

    // Recalculate travel allowance if employeeType changed
    const employeeType = updates.employeeType ?? user.employeeType;
    const travelAllowance = employeeType === "contractor" ? 12000 : 20000;

    await ctx.db.patch(userId, { ...updates, travelAllowance });
    return userId;
  },
});

// ── Delete user ────────────────────────────────────────────────────────────
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.role === "admin") throw new Error("Cannot delete admin user");

    // Soft delete
    await ctx.db.patch(userId, { isActive: false });
    return userId;
  },
});

// ── Migrate: copy faceImageUrl → avatarUrl for users who have face but no avatar ──
export const migrateFaceToAvatar = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let count = 0;
    for (const user of users) {
      if (!user.avatarUrl && user.faceImageUrl) {
        await ctx.db.patch(user._id, { avatarUrl: user.faceImageUrl });
        count++;
      }
    }
    return { migrated: count };
  },
});

// ── Update presence status ────────────────────────────────────────────────
export const updatePresenceStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("available"),
      v.literal("in_meeting"),
      v.literal("in_call"),
      v.literal("out_of_office"),
      v.literal("busy"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { presenceStatus: args.status });
  },
});

// ── Update avatar ──────────────────────────────────────────────────────────
export const updateAvatar = mutation({
  args: {
    userId: v.id("users"),
    avatarUrl: v.string(),
  },
  handler: async (ctx, { userId, avatarUrl }) => {
    await ctx.db.patch(userId, { avatarUrl });
    return userId;
  },
});

// ── Update session ─────────────────────────────────────────────────────────
export const updateSession = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    sessionExpiry: v.number(),
  },
  handler: async (ctx, { userId, sessionToken, sessionExpiry }) => {
    await ctx.db.patch(userId, {
      sessionToken,
      sessionExpiry,
      lastLoginAt: Date.now(),
    });
  },
});

// ── Clear session ──────────────────────────────────────────────────────────
export const clearSession = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, {
      sessionToken: undefined,
      sessionExpiry: undefined,
    });
  },
});

// ── Set WebAuthn challenge ─────────────────────────────────────────────────
export const setWebauthnChallenge = mutation({
  args: { userId: v.id("users"), challenge: v.string() },
  handler: async (ctx, { userId, challenge }) => {
    await ctx.db.patch(userId, { webauthnChallenge: challenge });
  },
});

// ── Get WebAuthn credentials ───────────────────────────────────────────────
export const getWebauthnCredentials = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("webauthnCredentials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ── Add WebAuthn credential ────────────────────────────────────────────────
export const addWebauthnCredential = mutation({
  args: {
    userId: v.id("users"),
    credentialId: v.string(),
    publicKey: v.string(),
    counter: v.number(),
    deviceName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("webauthnCredentials", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ── Update WebAuthn credential counter ────────────────────────────────────
export const updateWebauthnCounter = mutation({
  args: { credentialId: v.string(), counter: v.number() },
  handler: async (ctx, { credentialId, counter }) => {
    const cred = await ctx.db
      .query("webauthnCredentials")
      .withIndex("by_credential_id", (q) => q.eq("credentialId", credentialId))
      .unique();
    if (!cred) throw new Error("Credential not found");
    await ctx.db.patch(cred._id, { counter, lastUsedAt: Date.now() });
  },
});

// ── Get WebAuthn credential by ID ──────────────────────────────────────────
export const getWebauthnCredential = query({
  args: { credentialId: v.string() },
  handler: async (ctx, { credentialId }) => {
    return await ctx.db
      .query("webauthnCredentials")
      .withIndex("by_credential_id", (q) => q.eq("credentialId", credentialId))
      .unique();
  },
});

// ── Get supervisors list (supervisors + admins) ────────────────────────────
export const getSupervisors = query({
  args: {},
  handler: async (ctx) => {
    const supervisors = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "supervisor"))
      .collect();
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();
    return [...supervisors, ...admins];
  },
});

// ── Log audit event ────────────────────────────────────────────────────────
export const logAudit = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    target: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ── Get audit logs (admin only) ────────────────────────────────────────────
export const getAuditLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(100);
  },
});

// ── Get pending approval users (admin only) ────────────────────────────────
export const getPendingApprovalUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_approval", (q) => q.eq("isApproved", false))
      .collect();
  },
});

// ── Approve user (admin only) ──────────────────────────────────────────────
export const approveUser = mutation({
  args: {
    userId: v.id("users"),
    adminId: v.id("users"),
  },
  handler: async (ctx, { userId, adminId }) => {
    const admin = await ctx.db.get(adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Only admins can approve users");
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.isApproved) throw new Error("User already approved");

    await ctx.db.patch(userId, {
      isApproved: true,
      approvedBy: adminId,
      approvedAt: Date.now(),
    });

    // Notify user
    await ctx.db.insert("notifications", {
      userId: userId,
      type: "system",
      title: "Account Approved",
      message: `Your account has been approved by ${admin.name}. You can now log in.`,
      isRead: false,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// ── Reject user (admin only) ───────────────────────────────────────────────
export const rejectUser = mutation({
  args: {
    userId: v.id("users"),
    adminId: v.id("users"),
  },
  handler: async (ctx, { userId, adminId }) => {
    const admin = await ctx.db.get(adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Only admins can reject users");
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Delete the user
    await ctx.db.delete(userId);

    return userId;
  },
});
