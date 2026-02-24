import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Register user ──────────────────────────────────────────────────────────
export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(), // kept as "password" for Convex cloud compatibility; value is actually a hash
    phone: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("supervisor"), v.literal("employee"))),
    employeeType: v.optional(v.union(v.literal("staff"), v.literal("contractor"))),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
  },
  handler: async (ctx, { name, email, password: passwordHash, phone, role: forcedRole, employeeType: forcedType, department: forcedDept, position: forcedPos }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) throw new Error("Email already registered");

    // ONLY romangulanyan@gmail.com can be admin — no exceptions
    const ADMIN_EMAIL = "romangulanyan@gmail.com";
    const isAdminEmail = email.toLowerCase() === ADMIN_EMAIL;

    // Block any attempt to register as admin with a non-admin email
    if (forcedRole === "admin" && !isAdminEmail) {
      throw new Error("You are not authorized to register as admin");
    }

    const allUsers = await ctx.db.query("users").collect();
    const isFirstUser = allUsers.length === 0;
    // Admin role is ONLY for romangulanyan@gmail.com
    const role = isAdminEmail ? "admin" : "employee";

    const isContractor = email.toLowerCase().includes("contractor");
    const travelAllowance = isContractor ? 12000 : 20000;

    // Admin is auto-approved, regular users need approval
    const needsApproval = !isFirstUser && !isAdminEmail;

    const userId = await ctx.db.insert("users", {
      name,
      email,
      passwordHash,
      phone,
      role,
      employeeType: isContractor ? "contractor" : "staff",
      department: isAdminEmail || isFirstUser ? "Management" : undefined,
      position: isAdminEmail || isFirstUser ? "Administrator" : undefined,
      isActive: true,
      isApproved: !needsApproval,
      approvedBy: isFirstUser ? undefined : undefined,
      approvedAt: needsApproval ? undefined : Date.now(),
      travelAllowance,
      paidLeaveBalance: 24,
      sickLeaveBalance: 10,
      familyLeaveBalance: 5,
      createdAt: Date.now(),
    });

    // Notify admins about new user registration
    if (needsApproval) {
      const admins = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .collect();

      for (const admin of admins) {
        await ctx.db.insert("notifications", {
          userId: admin._id,
          type: "system",
          title: "New User Registration",
          message: `${name} (${email}) registered and is awaiting approval.`,
          isRead: false,
          relatedId: userId,
          createdAt: Date.now(),
        });
      }
    }

    return { userId, role, needsApproval };
  },
});

// ── Login user ─────────────────────────────────────────────────────────────
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(), // actually a hash
    sessionToken: v.string(),
    sessionExpiry: v.number(),
  },
  handler: async (ctx, { email, password: passwordHash, sessionToken, sessionExpiry }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) throw new Error("Invalid email or password");
    if (!user.isActive) throw new Error("Account is deactivated");
    if (!user.isApproved) throw new Error("Your account is pending admin approval");
    if (user.passwordHash !== passwordHash) throw new Error("Invalid email or password");

    await ctx.db.patch(user._id, {
      sessionToken,
      sessionExpiry,
      lastLoginAt: Date.now(),
    });

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      employeeType: user.employeeType,
      avatarUrl: user.avatarUrl,
      travelAllowance: user.travelAllowance,
    };
  },
});

// ── Logout user ────────────────────────────────────────────────────────────
export const logout = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, {
      sessionToken: undefined,
      sessionExpiry: undefined,
    });
  },
});

// ── Verify session ─────────────────────────────────────────────────────────
export const verifySession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const users = await ctx.db.query("users").collect();
    const user = users.find((u) => u.sessionToken === sessionToken);
    if (!user) return null;
    if (user.sessionExpiry && user.sessionExpiry < Date.now()) return null;
    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      employeeType: user.employeeType,
      avatarUrl: user.avatarUrl,
      travelAllowance: user.travelAllowance,
    };
  },
});

// ── Get session (alias for verifySession) ──────────────────────────────────
export const getSession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const users = await ctx.db.query("users").collect();
    const user = users.find((u) => u.sessionToken === sessionToken);
    if (!user) return null;
    if (user.sessionExpiry && user.sessionExpiry < Date.now()) return null;
    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      employeeType: user.employeeType,
      avatar: user.avatarUrl,
      travelAllowance: user.travelAllowance,
    };
  },
});

// ── Register WebAuthn credential ───────────────────────────────────────────
export const registerWebauthn = mutation({
  args: {
    userId: v.id("users"),
    credentialId: v.string(),
    publicKey: v.string(),
    counter: v.number(),
    deviceName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if credential already exists
    const existing = await ctx.db
      .query("webauthnCredentials")
      .withIndex("by_credential_id", (q) => q.eq("credentialId", args.credentialId))
      .unique();
    if (existing) throw new Error("Credential already registered");

    return await ctx.db.insert("webauthnCredentials", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ── Get WebAuthn credential for login ─────────────────────────────────────
export const getWebauthnCredential = query({
  args: { credentialId: v.string() },
  handler: async (ctx, { credentialId }) => {
    const cred = await ctx.db
      .query("webauthnCredentials")
      .withIndex("by_credential_id", (q) => q.eq("credentialId", credentialId))
      .unique();
    if (!cred) return null;
    const user = await ctx.db.get(cred.userId);
    return { ...cred, user };
  },
});

// ── Login via WebAuthn ─────────────────────────────────────────────────────
export const loginWebauthn = mutation({
  args: {
    credentialId: v.string(),
    counter: v.number(),
    sessionToken: v.string(),
    sessionExpiry: v.number(),
  },
  handler: async (ctx, { credentialId, counter, sessionToken, sessionExpiry }) => {
    const cred = await ctx.db
      .query("webauthnCredentials")
      .withIndex("by_credential_id", (q) => q.eq("credentialId", credentialId))
      .unique();
    if (!cred) throw new Error("Credential not found");

    const user = await ctx.db.get(cred.userId);
    if (!user) throw new Error("User not found");
    if (!user.isActive) throw new Error("Account is deactivated");

    // Update counter (replay attack prevention)
    if (counter <= cred.counter) throw new Error("Invalid authenticator counter");
    await ctx.db.patch(cred._id, { counter, lastUsedAt: Date.now() });

    await ctx.db.patch(user._id, {
      sessionToken,
      sessionExpiry,
      lastLoginAt: Date.now(),
    });

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      employeeType: user.employeeType,
      avatarUrl: user.avatarUrl,
      travelAllowance: user.travelAllowance,
    };
  },
});
