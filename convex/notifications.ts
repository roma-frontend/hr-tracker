import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Get notifications for a user ───────────────────────────────────────────
export const getUserNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

// ── Get unread count ───────────────────────────────────────────────────────
export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", userId).eq("isRead", false)
      )
      .collect();
    return unread.length;
  },
});

// ── Mark notification as read ──────────────────────────────────────────────
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { isRead: true });
  },
});

// ── Mark all as read ───────────────────────────────────────────────────────
export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", userId).eq("isRead", false)
      )
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }
    return unread.length;
  },
});

// ── Delete notification ────────────────────────────────────────────────────
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.delete(notificationId);
  },
});
