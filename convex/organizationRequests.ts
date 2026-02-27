import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SUPERADMIN_EMAIL = "romangulanyan@gmail.com";

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Create a self-service Starter organization (instant)
// ─────────────────────────────────────────────────────────────────────────────
export const createStarterOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    email: v.string(),
    password: v.string(),
    userName: v.string(),
    phone: v.optional(v.string()),
    country: v.optional(v.string()),
    industry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Normalize slug
    const slug = args.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) throw new Error("Invalid organization slug");

    // Check slug uniqueness
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existingOrg) throw new Error(`Organization "${slug}" already exists`);

    // Check email uniqueness
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();
    if (existingUser) throw new Error("This email is already registered");

    // Create organization (Starter plan)
    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug,
      plan: "starter",
      isActive: true,
      createdBySuperadmin: false,
      timezone: "UTC",
      country: args.country,
      industry: args.industry,
      employeeLimit: 50, // Starter limit
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create admin user
    const userId = await ctx.db.insert("users", {
      organizationId: orgId,
      name: args.userName,
      email: args.email.toLowerCase(),
      passwordHash: args.password, // should be hashed on client
      role: "admin",
      employeeType: "staff",
      department: "Management",
      position: "Administrator",
      phone: args.phone,
      isActive: true,
      isApproved: true,
      approvedAt: Date.now(),
      travelAllowance: 20000,
      paidLeaveBalance: 24,
      sickLeaveBalance: 10,
      familyLeaveBalance: 5,
      createdAt: Date.now(),
    });

    // Create welcome notification
    await ctx.db.insert("notifications", {
      organizationId: orgId,
      userId,
      type: "system",
      title: "🎉 Welcome to OfficeHub!",
      message: `Your organization "${args.name}" has been created successfully. You're on the Starter plan (50 employees max).`,
      isRead: false,
      createdAt: Date.now(),
    });

    return { organizationId: orgId, userId };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Request Professional/Enterprise organization (requires approval)
// ─────────────────────────────────────────────────────────────────────────────
export const requestOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    email: v.string(),
    password: v.string(),
    userName: v.string(),
    phone: v.optional(v.string()),
    plan: v.union(v.literal("professional"), v.literal("enterprise")),
    country: v.optional(v.string()),
    industry: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Normalize slug
    const slug = args.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) throw new Error("Invalid organization slug");

    // Check if slug is already taken
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existingOrg) throw new Error(`Organization "${slug}" already exists`);

    // Check if this email already requested
    const existingRequest = await ctx.db
      .query("organizationRequests")
      .withIndex("by_email", (q) => q.eq("requesterEmail", args.email.toLowerCase()))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .unique();
    if (existingRequest)
      throw new Error("You already have a pending organization request");

    // Check if email is already registered
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();
    if (existingUser) throw new Error("This email is already registered");

    // Create request
    const requestId = await ctx.db.insert("organizationRequests", {
      requestedName: args.name,
      requestedSlug: slug,
      requesterName: args.userName,
      requesterEmail: args.email.toLowerCase(),
      requesterPhone: args.phone,
      requesterPassword: args.password, // hashed
      requestedPlan: args.plan,
      industry: args.industry,
      country: args.country,
      teamSize: args.teamSize,
      description: args.description,
      status: "pending",
      createdAt: Date.now(),
    });

    // Notify superadmin
    const superadmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", SUPERADMIN_EMAIL))
      .unique();

    if (superadmin) {
      await ctx.db.insert("notifications", {
        organizationId: superadmin.organizationId,
        userId: superadmin._id,
        type: "system",
        title: "🏢 New Organization Request",
        message: `${args.userName} requested to create "${args.name}" (${args.plan} plan)`,
        isRead: false,
        relatedId: requestId,
        createdAt: Date.now(),
      });
    }

    return { requestId };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SUPERADMIN: Get all organization requests
// ─────────────────────────────────────────────────────────────────────────────
export const getOrganizationRequests = query({
  args: {
    superadminUserId: v.id("users"),
    status: v.optional(
      v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))
    ),
  },
  handler: async (ctx, { superadminUserId, status }) => {
    const superadmin = await ctx.db.get(superadminUserId);
    if (!superadmin || superadmin.email.toLowerCase() !== SUPERADMIN_EMAIL) {
      throw new Error("Superadmin only");
    }

    let requests;
    if (status) {
      requests = await ctx.db
        .query("organizationRequests")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    } else {
      requests = await ctx.db
        .query("organizationRequests")
        .order("desc")
        .collect();
    }

    return requests;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SUPERADMIN: Approve organization request
// ─────────────────────────────────────────────────────────────────────────────
export const approveOrganizationRequest = mutation({
  args: {
    superadminUserId: v.id("users"),
    requestId: v.id("organizationRequests"),
  },
  handler: async (ctx, { superadminUserId, requestId }) => {
    const superadmin = await ctx.db.get(superadminUserId);
    if (!superadmin || superadmin.email.toLowerCase() !== SUPERADMIN_EMAIL) {
      throw new Error("Only superadmin can approve organization requests");
    }

    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found");
    if (request.status !== "pending")
      throw new Error("This request has already been reviewed");

    // Check slug availability again
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", request.requestedSlug))
      .unique();
    if (existingOrg) throw new Error("Organization slug is already taken");

    // Determine employee limit
    const employeeLimit = request.requestedPlan === "professional" ? 200 : 999999;

    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: request.requestedName,
      slug: request.requestedSlug,
      plan: request.requestedPlan,
      isActive: true,
      createdBySuperadmin: true,
      timezone: "UTC",
      country: request.country,
      industry: request.industry,
      employeeLimit,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create admin user
    const userId = await ctx.db.insert("users", {
      organizationId: orgId,
      name: request.requesterName,
      email: request.requesterEmail,
      passwordHash: request.requesterPassword,
      role: "admin",
      employeeType: "staff",
      department: "Management",
      position: "Administrator",
      phone: request.requesterPhone,
      isActive: true,
      isApproved: true,
      approvedBy: superadminUserId,
      approvedAt: Date.now(),
      travelAllowance: 20000,
      paidLeaveBalance: 24,
      sickLeaveBalance: 10,
      familyLeaveBalance: 5,
      createdAt: Date.now(),
    });

    // Update request status
    await ctx.db.patch(requestId, {
      status: "approved",
      reviewedBy: superadminUserId,
      reviewedAt: Date.now(),
      organizationId: orgId,
      userId,
    });

    // Notify the requester
    await ctx.db.insert("notifications", {
      organizationId: orgId,
      userId,
      type: "system",
      title: "✅ Organization Approved!",
      message: `Your organization "${request.requestedName}" has been approved! You can now log in and start managing your team.`,
      isRead: false,
      relatedId: requestId,
      createdAt: Date.now(),
    });

    return { organizationId: orgId, userId };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SUPERADMIN: Reject organization request
// ─────────────────────────────────────────────────────────────────────────────
export const rejectOrganizationRequest = mutation({
  args: {
    superadminUserId: v.id("users"),
    requestId: v.id("organizationRequests"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { superadminUserId, requestId, reason }) => {
    const superadmin = await ctx.db.get(superadminUserId);
    if (!superadmin || superadmin.email.toLowerCase() !== SUPERADMIN_EMAIL) {
      throw new Error("Only superadmin can reject organization requests");
    }

    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found");
    if (request.status !== "pending")
      throw new Error("This request has already been reviewed");

    await ctx.db.patch(requestId, {
      status: "rejected",
      reviewedBy: superadminUserId,
      reviewedAt: Date.now(),
      rejectionReason: reason,
    });

    return { requestId };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Get pending request count (for superadmin badge)
// ─────────────────────────────────────────────────────────────────────────────
export const getPendingRequestCount = query({
  args: { superadminUserId: v.id("users") },
  handler: async (ctx, { superadminUserId }) => {
    const superadmin = await ctx.db.get(superadminUserId);
    if (!superadmin || superadmin.email.toLowerCase() !== SUPERADMIN_EMAIL) {
      return 0;
    }

    const pending = await ctx.db
      .query("organizationRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return pending.length;
  },
});
