# RBAC Migration Guide

## Overview

Server-side RBAC (Role-Based Access Control) has been implemented in `convex/lib/rbac.ts`.
This prevents client-side role bypass attacks where malicious clients could skip role checks.

## Current State

- Most role checks are currently on the **client side** (e.g., `user?.role === 'admin'`)
- Some functions have server-side checks (e.g., `requireAdmin` in `users.ts`)

## Goal

Migrate ALL role checks to server-side using the RBAC helpers.

## Available RBAC Functions

### 1. `requireUser(ctx, userId)`

Basic authentication check. Returns user or throws.

```ts
import { requireUser } from '../lib/rbac';

export const getUserProfile = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.userId);
    // Proceed with authenticated user
    return user;
  },
});
```

### 2. `requireRole(ctx, userId, 'admin')`

Exact role check (or superadmin by email).

```ts
import { requireRole } from '../lib/rbac';

export const deleteUser = mutation({
  args: { userId: v.id('users'), adminId: v.id('users') },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.adminId, 'admin');
    // Proceed with admin
  },
});
```

### 3. `requireRoleAtLeast(ctx, userId, 'supervisor')`

Hierarchical role check (supervisor OR admin OR superadmin).

```ts
import { requireRoleAtLeast } from '../lib/rbac';

export const viewTeamPerformance = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await requireRoleAtLeast(ctx, args.userId, 'supervisor');
    // supervisor, admin, or superadmin can access
  },
});
```

### 4. `requireOrgAdmin(ctx, userId, organizationId)`

Admin of specific organization check.

```ts
import { requireOrgAdmin } from '../lib/rbac';

export const approveLeaveRequest = mutation({
  args: { leaveId: v.id('leaveRequests'), adminId: v.id('users') },
  handler: async (ctx, args) => {
    const leave = await ctx.db.get(args.leaveId);
    await requireOrgAdmin(ctx, args.adminId, leave!.organizationId);
    // Proceed with org admin
  },
});
```

### 5. `requireOrgSupervisor(ctx, userId, organizationId)`

Supervisor or admin of specific organization.

```ts
import { requireOrgSupervisor } from '../lib/rbac';

export const viewTeamLeaves = query({
  args: { userId: v.id('users'), organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    await requireOrgSupervisor(ctx, args.userId, args.organizationId);
    // Proceed with supervisor
  },
});
```

### 6. `canAccessUser(ctx, requesterId, targetUserId)`

Check if user can access another user's data.

```ts
import { canAccessUser } from '../lib/rbac';

export const getUserProfile = query({
  args: { requesterId: v.id('users'), targetUserId: v.id('users') },
  handler: async (ctx, args) => {
    const hasAccess = await canAccessUser(ctx, args.requesterId, args.targetUserId);
    if (!hasAccess) {
      throw new Error('Access denied');
    }
    return ctx.db.get(args.targetUserId);
  },
});
```

### 7. `withRBAC({ minimumRole: 'admin' }, handler)`

Middleware wrapper for easy RBAC.

```ts
import { withRBAC } from '../lib/rbac';

export const deleteUser = mutation(
  withRBAC({ minimumRole: 'admin' }, async (ctx, args) => {
    // Your mutation code - role already verified
    await ctx.db.delete(args.userId);
  }),
);
```

## Migration Steps

### Step 1: Identify client-side role checks

Search for patterns like:

- `user?.role === 'admin'`
- `user?.role === 'superadmin'`
- `if (user.role !== 'admin')`

### Step 2: Add server-side RBAC

Replace client-side checks with server-side RBAC calls.

**Before (insecure):**

```ts
// Client checks role
if (user?.role === 'admin') {
  await api.users.deleteUser({ userId });
}
```

**After (secure):**

```ts
// Server checks role via RBAC
await api.users.deleteUser({ userId, adminId: user.id });
```

```ts
// In convex/users.ts:
export const deleteUser = mutation({
  args: { userId: v.id('users'), adminId: v.id('users') },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.adminId, 'admin');
    // Delete user
  },
});
```

### Step 3: Test

Test with different roles to ensure RBAC works correctly:

- Superadmin: should have access to everything
- Admin: should have org-level access
- Supervisor: should have team-level access
- Employee: should have only personal access

## Role Hierarchy

```
superadmin > admin > supervisor > driver > employee
```

## Priority Functions to Migrate

1. **HIGH**: User management (deleteUser, updateUser, suspendUser)
2. **HIGH**: Leave approvals (approveLeave, rejectLeave)
3. **HIGH**: Organization management (updateOrgSettings, manageOrgMembers)
4. **MEDIUM**: Task management (assignTask, deleteTask)
5. **MEDIUM**: Chat features (deleteMessage, manageConversation)
6. **LOW**: UI-only features (showDashboardWidget)

## Example: Full Migration

### Before (client-side check)

```tsx
// src/components/employees/EmployeesClient.tsx
const handleDelete = async (employeeId: Id<'users'>) => {
  if (user?.role !== 'admin' && user?.role !== 'superadmin') {
    toast.error('Not authorized');
    return;
  }
  await api.users.deleteEmployee({ employeeId });
};
```

### After (server-side RBAC)

```tsx
// src/components/employees/EmployeesClient.tsx
const handleDelete = async (employeeId: Id<'users'>) => {
  // No client-side check needed - server will verify
  await api.users.deleteEmployee({ employeeId, adminId: user.id });
};
```

```ts
// convex/users.ts
export const deleteEmployee = mutation({
  args: {
    employeeId: v.id('users'),
    adminId: v.id('users'), // Server verifies this user's role
  },
  handler: async (ctx, args) => {
    // Server-side RBAC check
    await requireRoleAtLeast(ctx, args.adminId, 'admin');

    // Proceed with deletion
    await ctx.db.delete(args.employeeId);
  },
});
```

## Security Benefits

1. **Cannot bypass role checks**: Malicious client cannot skip role verification
2. **Consistent enforcement**: All functions use same RBAC logic
3. **Audit trail**: All role checks are logged server-side
4. **Fine-grained control**: Can add org-scoped permissions easily
