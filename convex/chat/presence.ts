import { v } from 'convex/values';
import { query } from '../_generated/server';
import type { Id, Doc } from '../_generated/dataModel';

/**
 * Helper to batch-load users and their leave status
 * Eliminates N+1 queries for presence status calculation
 */
export async function getUsersWithLeaveStatus(
  ctx: {
    db: {
      get: (id: Id<'users'>) => Promise<Doc<'users'> | null>;
      query: (table: 'leaveRequests') => { collect: () => Promise<Doc<'leaveRequests'>[]> };
    };
  },
  userIds: Id<'users'>[],
) {
  if (userIds.length === 0) return { userMap: new Map(), result: new Map() };

  const today = new Date().toISOString().split('T')[0];
  if (!today) return { userMap: new Map(), result: new Map() };

  // Batch load all users
  const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
  const userMap = new Map(users.map((u) => [u?._id, u]));

  // Batch load all approved leaves for these users
  const allLeaves = await ctx.db.query('leaveRequests').collect();
  const userLeavesMap = new Map<
    Id<'users'>,
    Array<{
      userId: Id<'users'>;
      status: string;
      startDate: string;
      endDate: string;
    }>
  >();

  userIds.forEach((id) => {
    const leaves = allLeaves.filter(
      (l) =>
        l.userId === id && l.status === 'approved' && l.startDate <= today && today <= l.endDate,
    );
    userLeavesMap.set(id, leaves);
  });

  // Calculate effective presence status
  const result = new Map<Id<'users'>, { presenceStatus: string; hasActiveLeave: boolean }>();
  userIds.forEach((id) => {
    const user = userMap.get(id);
    const leaves = userLeavesMap.get(id) || [];
    const hasActiveLeave = leaves.length > 0;
    const effectivePresenceStatus = hasActiveLeave
      ? 'out_of_office'
      : (user?.presenceStatus ?? 'available');

    result.set(id, { presenceStatus: effectivePresenceStatus, hasActiveLeave });
  });

  return { userMap, result };
}

/**
 * Get presence status for a single user, accounting for approved leave
 */
export const getUserPresenceStatus = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0] || '';
    let effectivePresenceStatus = user.presenceStatus ?? 'available';
    let hasActiveLeave = false;

    if (today) {
      const approvedLeaves = await ctx.db
        .query('leaveRequests')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .filter((q) => q.eq(q.field('status'), 'approved'))
        .collect();

      hasActiveLeave = approvedLeaves.some((leave) => {
        return leave.startDate <= today && today <= leave.endDate;
      });

      if (hasActiveLeave) {
        effectivePresenceStatus = 'out_of_office';
      }
    }

    return {
      _id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      presenceStatus: effectivePresenceStatus,
      hasActiveLeave,
      department: user.department,
      position: user.position,
    };
  },
});
