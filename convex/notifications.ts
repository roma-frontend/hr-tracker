import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { MAX_PAGE_SIZE } from './pagination';

// ── Get notifications for a user ───────────────────────────────────────────
export const getUserNotifications = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .take(50);
  },
});

// ── Get unread count ───────────────────────────────────────────────────────
export const getUnreadCount = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) => q.eq('userId', userId).eq('isRead', false))
      .take(MAX_PAGE_SIZE);
    return Math.min(unread.length, MAX_PAGE_SIZE);
  },
});

// ── Mark notification as read ──────────────────────────────────────────────
export const markAsRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { isRead: true });
  },
});

// ── Mark all as read ───────────────────────────────────────────────────────
export const markAllAsRead = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    // NOTE: Using .collect() here because we must mark ALL unread notifications as read for this user
    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) => q.eq('userId', userId).eq('isRead', false))
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }
    return unread.length;
  },
});

// ── Delete notification ────────────────────────────────────────────────────
export const deleteNotification = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.delete(notificationId);
  },
});
