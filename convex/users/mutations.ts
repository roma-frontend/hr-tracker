import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import { requireRole, requireOrgAdmin, requireUser } from '../lib/rbac';
import { isSuperadminEmail } from '../lib/auth';
import { MAX_PAGE_SIZE } from '../pagination';

// ─────────────────────────────────────────────────────────────────────────────
// CREATE USER (admin only) — auto-scoped to admin's org
// ─────────────────────────────────────────────────────────────────────────────
export const createUser = mutation({
  args: {
    adminId: v.id('users'),
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(
      v.literal('admin'),
      v.literal('supervisor'),
      v.literal('employee'),
      v.literal('driver'),
    ),
    employeeType: v.union(v.literal('staff'), v.literal('contractor')),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    phone: v.optional(v.string()),
    supervisorId: v.optional(v.id('users')),
    organizationId: v.optional(v.id('organizations')),
  },
  handler: async (ctx, { adminId, organizationId, ...args }) => {
    // RBAC: require org admin access (superadmin can create in any org)
    const caller = await requireUser(ctx, adminId);
    const isSuperadmin = isSuperadminEmail(caller.email);

    const email = args.email.toLowerCase().trim();

    // Check email uniqueness globally
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();
    if (existing) throw new Error('A user with this email already exists');

    // Determine target organization:
    const targetOrgId = organizationId || (isSuperadmin ? null : caller.organizationId);

    if (!targetOrgId) {
      throw new Error(
        isSuperadmin
          ? 'Superadmin must specify an organization when creating users'
          : 'Admin must belong to an organization',
      );
    }

    // RBAC: verify caller has admin access to the target org
    if (!isSuperadmin) {
      await requireOrgAdmin(ctx, adminId, targetOrgId);
    }

    const org = await ctx.db.get(targetOrgId);
    if (!org) throw new Error('Organization not found');

    // NOTE: Using .collect() here because we need an accurate count of ALL active members to enforce the employee limit
    const currentCount = await ctx.db
      .query('users')
      .withIndex('by_org_active', (q) => q.eq('organizationId', targetOrgId).eq('isActive', true))
      .collect();

    if (currentCount.length >= org.employeeLimit) {
      throw new Error(
        `Employee limit reached (${org.employeeLimit}). Upgrade your plan to add more employees.`,
      );
    }

    const travelAllowance = args.employeeType === 'contractor' ? 12000 : 20000;

    const userId = await ctx.db.insert('users', {
      organizationId: targetOrgId,
      name: args.name,
      email,
      passwordHash: args.passwordHash,
      role: args.role,
      employeeType: args.employeeType,
      department: args.department,
      position: args.position,
      phone: args.phone,
      supervisorId: args.supervisorId,
      isActive: true,
      isApproved: true,
      approvedBy: adminId,
      approvedAt: Date.now(),
      travelAllowance,
      paidLeaveBalance: 24,
      sickLeaveBalance: 10,
      familyLeaveBalance: 5,
      createdAt: Date.now(),
    });

    // Notify org admins (within same org)
    // NOTE: Using .collect() here because we must notify ALL admins of a new employee; truncating would miss recipients
    const admins = await ctx.db
      .query('users')
      .withIndex('by_org_role', (q) => q.eq('organizationId', targetOrgId).eq('role', 'admin'))
      .collect();

    for (const a of admins) {
      await ctx.db.insert('notifications', {
        organizationId: targetOrgId,
        userId: a._id,
        type: 'employee_added',
        title: '👤 New Employee Added',
        message: `${args.name} (${args.role}) has been added to ${org.name}.`,
        isRead: false,
        relatedId: userId,
        createdAt: Date.now(),
      });
    }

    return userId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE USER — only within same org
// ─────────────────────────────────────────────────────────────────────────────
export const updateUser = mutation({
  args: {
    adminId: v.id('users'),
    userId: v.id('users'),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal('admin'),
        v.literal('supervisor'),
        v.literal('employee'),
        v.literal('driver'),
      ),
    ),
    employeeType: v.optional(v.union(v.literal('staff'), v.literal('contractor'))),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    supervisorId: v.optional(v.id('users')),
    isActive: v.optional(v.boolean()),
    paidLeaveBalance: v.optional(v.number()),
    sickLeaveBalance: v.optional(v.number()),
    familyLeaveBalance: v.optional(v.number()),
  },
  handler: async (ctx, { adminId, userId, ...updates }) => {
    // RBAC: require org admin access
    const caller = await requireUser(ctx, adminId);
    const isSuperadmin = isSuperadminEmail(caller.email);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found');

    // RBAC: verify same organization (superadmin can update any org)
    if (!isSuperadmin) {
      await requireOrgAdmin(ctx, adminId, user.organizationId as Id<'organizations'>);
    }

    const employeeType = updates.employeeType ?? user.employeeType;
    const travelAllowance = employeeType === 'contractor' ? 12000 : 20000;

    await ctx.db.patch(userId, { ...updates, travelAllowance });
    return userId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE USER — soft delete, only within same org
// ─────────────────────────────────────────────────────────────────────────────
export const deleteUser = mutation({
  args: {
    adminId: v.id('users'),
    userId: v.id('users'),
  },
  handler: async (ctx, { adminId, userId }) => {
    // RBAC: require org admin access
    const caller = await requireUser(ctx, adminId);
    const isSuperadmin = isSuperadminEmail(caller.email);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found');

    // RBAC: cross-org protection (superadmin can delete from any org)
    if (!isSuperadmin) {
      await requireOrgAdmin(ctx, adminId, user.organizationId as Id<'organizations'>);
    }

    // Protect superadmin
    if (user.role === 'superadmin' && !isSuperadmin) {
      throw new Error('Only superadmin can deactivate superadmin account');
    }

    // Protect other admins
    if (user.role === 'admin' && caller.role === 'admin' && !isSuperadmin) {
      throw new Error('Only superadmin can deactivate admin accounts');
    }

    if (user.role === 'admin' && user.email.toLowerCase() === caller.email.toLowerCase()) {
      throw new Error('Cannot delete your own admin account');
    }

    await ctx.db.patch(userId, { isActive: false });
    return userId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// HARD DELETE USER — completely removes user from database
// ─────────────────────────────────────────────────────────────────────────────
export const hardDeleteUser = mutation({
  args: {
    adminId: v.id('users'),
    userId: v.id('users'),
  },
  handler: async (ctx, { adminId, userId }) => {
    // RBAC: require superadmin role
    await requireRole(ctx, adminId, 'superadmin');

    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found');

    // Hard delete - remove from database completely
    await ctx.db.delete(userId);
    return userId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// APPROVE USER — scoped to org
// ─────────────────────────────────────────────────────────────────────────────
export const approveUser = mutation({
  args: {
    adminId: v.id('users'),
    userId: v.id('users'),
  },
  handler: async (ctx, { adminId, userId }) => {
    // RBAC: require org admin access
    const caller = await requireUser(ctx, adminId);
    const isSuperadmin = isSuperadminEmail(caller.email);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found');

    // RBAC: cross-org protection
    if (!isSuperadmin) {
      await requireOrgAdmin(ctx, adminId, user.organizationId as Id<'organizations'>);
    }

    if (user.isApproved) throw new Error('User already approved');

    let org = null;
    if (user.organizationId) {
      org = await ctx.db.get(user.organizationId);
    }

    const callerUser = await ctx.db.get(adminId);

    await ctx.db.patch(userId, {
      isApproved: true,
      approvedBy: adminId,
      approvedAt: Date.now(),
    });

    await ctx.db.insert('notifications', {
      organizationId: user.organizationId,
      userId,
      type: 'join_approved',
      title: '✅ Account Approved',
      message: `Your account has been approved by ${callerUser?.name ?? 'admin'}. Welcome to ${org?.name ?? 'the team'}!`,
      isRead: false,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// REJECT USER — scoped to org
// ─────────────────────────────────────────────────────────────────────────────
export const rejectUser = mutation({
  args: {
    adminId: v.id('users'),
    userId: v.id('users'),
  },
  handler: async (ctx, { adminId, userId }) => {
    // RBAC: require org admin access
    const caller = await requireUser(ctx, adminId);
    const isSuperadmin = isSuperadminEmail(caller.email);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found');

    // RBAC: cross-org protection
    if (!isSuperadmin) {
      await requireOrgAdmin(ctx, adminId, user.organizationId as Id<'organizations'>);
    }

    await ctx.db.delete(userId);
    return userId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE OWN PROFILE (users can update their own profile without admin)
// ─────────────────────────────────────────────────────────────────────────────
export const updateOwnProfile = mutation({
  args: {
    userId: v.id('users'),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    // Productivity Settings
    focusModeEnabled: v.optional(v.boolean()),
    workHoursStart: v.optional(v.string()),
    workHoursEnd: v.optional(v.string()),
    breakRemindersEnabled: v.optional(v.boolean()),
    breakInterval: v.optional(v.number()),
    dailyTaskGoal: v.optional(v.number()),
    // Localization Settings
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    timeFormat: v.optional(v.string()),
    firstDayOfWeek: v.optional(v.string()),
    // Dashboard Settings
    defaultView: v.optional(v.string()),
    dataRefreshRate: v.optional(v.string()),
    compactMode: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, ...updates }) => {
    // RBAC: verify ownership
    await requireUser(ctx, userId);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found');

    await ctx.db.patch(userId, updates);
    return userId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PRESENCE STATUS
// ─────────────────────────────────────────────────────────────────────────────
export const updatePresenceStatus = mutation({
  args: {
    userId: v.id('users'),
    presenceStatus: v.union(
      v.literal('available'),
      v.literal('in_meeting'),
      v.literal('in_call'),
      v.literal('out_of_office'),
      v.literal('busy'),
    ),
    outOfOfficeMessage: v.optional(v.string()),
  },
  handler: async (ctx, { userId, presenceStatus, outOfOfficeMessage: _outOfOfficeMessage }) => {
    // RBAC: verify ownership
    await requireUser(ctx, userId);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found');

    // Update status
    await ctx.db.patch(userId, {
      presenceStatus,
      updatedAt: Date.now(),
    });

    return { success: true, newStatus: presenceStatus };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE AVATAR
// ─────────────────────────────────────────────────────────────────────────────
export const updateAvatar = mutation({
  args: { userId: v.id('users'), avatarUrl: v.string() },
  handler: async (ctx, { userId, avatarUrl }) => {
    // RBAC: verify ownership
    await requireUser(ctx, userId);

    await ctx.db.patch(userId, { avatarUrl });
    return userId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE AVATAR
// ─────────────────────────────────────────────────────────────────────────────
export const deleteAvatar = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    // RBAC: verify ownership
    await requireUser(ctx, userId);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found');

    // Remove avatar URL from database
    await ctx.db.patch(userId, {
      avatarUrl: undefined,
    });

    return userId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SET STATUS TO IN CALL — called automatically when starting a call
// ─────────────────────────────────────────────────────────────────────────────
export const setInCallStatus = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, { userId }) => {
    // RBAC: verify ownership
    await requireUser(ctx, userId);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found');

    // Only update if not already "in_call"
    if (user.presenceStatus !== 'in_call') {
      await ctx.db.patch(userId, {
        presenceStatus: 'in_call',
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// RESET STATUS FROM IN CALL — called when call ends
// ─────────────────────────────────────────────────────────────────────────────
export const resetFromCallStatus = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, { userId }) => {
    // RBAC: verify ownership
    await requireUser(ctx, userId);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found');

    // Reset to available if they're currently in_call
    if (user.presenceStatus === 'in_call') {
      await ctx.db.patch(userId, {
        presenceStatus: 'available',
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
