/**
 * Chat Conversations Module
 * 
 * Handles conversation creation, retrieval, and management
 * Split from convex/chat.ts for better maintainability
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Helper to batch-load users and their leave status
 */
async function getUsersWithLeaveStatus(ctx: any, userIds: Id<"users">[]) {
  if (userIds.length === 0) return { userMap: new Map(), result: new Map() };

  const today = new Date().toISOString().split("T")[0];

  const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
  const userMap = new Map(users.map((u) => [u?._id, u]));

  const allLeaves = await ctx.db.query("leaveRequests").collect();
  const userLeavesMap = new Map<Id<"users">, any[]>();

  userIds.forEach((id) => {
    const leaves = allLeaves.filter(
      (l: any) => l.userId === id && l.status === "approved" && l.startDate <= today && today <= l.endDate
    );
    userLeavesMap.set(id, leaves);
  });

  const result = new Map<Id<"users">, { presenceStatus: string; hasActiveLeave: boolean }>();
  userIds.forEach((id) => {
    const user = userMap.get(id);
    const leaves = userLeavesMap.get(id) || [];
    const hasActiveLeave = leaves.length > 0;
    const effectivePresenceStatus = hasActiveLeave ? "out_of_office" : (user?.presenceStatus ?? "available");
    result.set(id, { presenceStatus: effectivePresenceStatus, hasActiveLeave });
  });

  return { userMap, result };
}

// ─── CONVERSATIONS ────────────────────────────────────────────────────────────

/** Get or create a direct message conversation between two users */
export const getOrCreateDM = mutation({
  args: {
    organizationId: v.id("organizations"),
    currentUserId: v.id("users"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const ids = [args.currentUserId, args.targetUserId].sort();
    const dmKey = ids.join("_");

    const existing = await ctx.db
      .query("chatConversations")
      .withIndex("by_dm_key", (q) => q.eq("dmKey", dmKey))
      .first();

    if (existing) return existing._id;

    const now = Date.now();
    const convId = await ctx.db.insert("chatConversations", {
      organizationId: args.organizationId,
      type: "direct",
      createdBy: args.currentUserId,
      dmKey,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("chatMembers", {
      conversationId: convId,
      userId: args.currentUserId,
      organizationId: args.organizationId,
      role: "member",
      unreadCount: 0,
      isMuted: false,
      joinedAt: now,
    });
    await ctx.db.insert("chatMembers", {
      conversationId: convId,
      userId: args.targetUserId,
      organizationId: args.organizationId,
      role: "member",
      unreadCount: 0,
      isMuted: false,
      joinedAt: now,
    });

    return convId;
  },
});

/** Create a group conversation */
export const createGroup = mutation({
  args: {
    organizationId: v.id("organizations"),
    createdBy: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    memberIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const convId = await ctx.db.insert("chatConversations", {
      organizationId: args.organizationId,
      type: "group",
      name: args.name,
      description: args.description,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("chatMembers", {
      conversationId: convId,
      userId: args.createdBy,
      organizationId: args.organizationId,
      role: "owner",
      unreadCount: 0,
      isMuted: false,
      joinedAt: now,
    });

    for (const uid of args.memberIds) {
      if (uid === args.createdBy) continue;
      await ctx.db.insert("chatMembers", {
        conversationId: convId,
        userId: uid,
        organizationId: args.organizationId,
        role: "member",
        unreadCount: 0,
        isMuted: false,
        joinedAt: now,
      });
    }

    await ctx.db.insert("chatMessages", {
      conversationId: convId,
      organizationId: args.organizationId,
      senderId: args.createdBy,
      type: "system",
      content: `Group "${args.name}" was created`,
      createdAt: now,
    });

    return convId;
  },
});

/**
 * Get all conversations for a user in their organization
 * OPTIMIZED: Batch loading eliminates N+1 queries
 */
export const getMyConversations = query({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("chatMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const conversationIds = memberships.map((m) => m.conversationId);
    const conversations = await Promise.all(conversationIds.map((id) => ctx.db.get(id)));

    const validConvs = conversations.filter((conv, idx) => {
      const membership = memberships[idx];
      if (!conv) return false;
      if (membership?.isDeleted) return false;
      if (conv.organizationId !== args.organizationId) return false;
      return true;
    });

    const validMemberships = memberships.filter((m, idx) => validConvs[idx] !== null);
    const filteredConvs = validConvs.filter(Boolean) as any[];

    const allUserIds = new Set<Id<"users">>();
    filteredConvs.forEach((conv) => {
      if (conv.type === "direct") allUserIds.add(conv.createdBy);
      else if (conv.type === "group") allUserIds.add(conv.createdBy);
    });

    const { userMap, result: userStatusMap } = await getUsersWithLeaveStatus(ctx, Array.from(allUserIds));

    const allGroupMembers = await ctx.db.query("chatMembers").collect();
    const groupMembersMap = new Map<Id<"chatConversations">, any[]>();
    filteredConvs.forEach((conv) => {
      if (conv.type === "group") {
        const members = allGroupMembers.filter((m) => m.conversationId === conv._id);
        groupMembersMap.set(conv._id, members);
      }
    });

    const groupMemberUserIds = new Set<Id<"users">>();
    Array.from(groupMembersMap.values()).flat().forEach((m) => groupMemberUserIds.add(m.userId));
    const groupMemberUsers = await getUsersWithLeaveStatus(ctx, Array.from(groupMemberUserIds));

    const conversationsWithDetails = filteredConvs.map((conv, idx) => {
      const membership = validMemberships[idx];

      let otherUser = null;
      if (conv.type === "direct") {
        const convMembers = allGroupMembers.filter((m) => m.conversationId === conv._id);
        const otherMember = convMembers.find((m) => m.userId !== args.userId);
        if (otherMember) {
          const status = userStatusMap.get(otherMember.userId);
          otherUser = {
            _id: otherMember.userId,
            name: userMap.get(otherMember.userId)?.name || "Unknown",
            avatarUrl: userMap.get(otherMember.userId)?.avatarUrl,
            presenceStatus: status?.presenceStatus || "available",
          };
        }
      }

      let members: any[] = [];
      if (conv.type === "group") {
        const groupMembers = groupMembersMap.get(conv._id) || [];
        members = groupMembers.map((m) => ({
          userId: m.userId,
          user: groupMemberUsers.userMap.get(m.userId)
            ? { name: groupMemberUsers.userMap.get(m.userId)!.name, avatarUrl: groupMemberUsers.userMap.get(m.userId)!.avatarUrl }
            : null,
        }));
      }

      const memberCount = conv.type === "group" ? (groupMembersMap.get(conv._id)?.length || 0) : 2;

      return { ...conv, membership, otherUser, memberCount, members };
    });

    return conversationsWithDetails.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.lastMessageAt ?? b.createdAt) - (a.lastMessageAt ?? a.createdAt);
    });
  },
});

/** Get all members of a conversation */
export const getConversationMembers = query({
  args: { conversationId: v.id("chatConversations") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const today = new Date().toISOString().split('T')[0];

    return Promise.all(
      members.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        let effectivePresenceStatus = user?.presenceStatus ?? "available";

        if (user) {
          const approvedLeaves = await ctx.db
            .query("leaveRequests")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("status"), "approved"))
            .collect();

          const hasActiveLeave = approvedLeaves.some((leave) => leave.startDate <= today && today <= leave.endDate);
          if (hasActiveLeave) effectivePresenceStatus = "out_of_office";
        }

        return {
          ...m,
          user: user ? {
            _id: user._id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            presenceStatus: effectivePresenceStatus,
            department: user.department,
            position: user.position,
          } : null,
        };
      })
    );
  },
});

/** Update group info */
export const updateGroup = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();
    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Not authorized");
    }
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    await ctx.db.patch(args.conversationId, updates);
  },
});

/** Add member to group */
export const addMember = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    requesterId: v.id("users"),
    userId: v.id("users"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();
    if (existing) return;

    const now = Date.now();
    await ctx.db.insert("chatMembers", {
      conversationId: args.conversationId,
      userId: args.userId,
      organizationId: args.organizationId,
      role: "member",
      unreadCount: 0,
      isMuted: false,
      joinedAt: now,
    });

    const user = await ctx.db.get(args.userId);
    await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      organizationId: args.organizationId,
      senderId: args.requesterId,
      type: "system",
      content: `${user?.name ?? "Someone"} was added to the group`,
      createdAt: now,
    });
  },
});

/** Leave / remove from group */
export const leaveConversation = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();
    if (!membership) return;
    await ctx.db.delete(membership._id);

    const user = await ctx.db.get(args.userId);
    const conv = await ctx.db.get(args.conversationId);
    if (conv) {
      await ctx.db.insert("chatMessages", {
        conversationId: args.conversationId,
        organizationId: conv.organizationId,
        senderId: args.userId,
        type: "system",
        content: `${user?.name ?? "Someone"} left the group`,
        createdAt: Date.now(),
      });
    }
  },
});

/** Pin/unpin conversation */
export const togglePin = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const member = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!member) throw new Error("Not a member of this conversation");

    await ctx.db.patch(args.conversationId, {
      isPinned: !conv.isPinned,
      updatedAt: Date.now(),
    });
    return !conv.isPinned;
  },
});

/** Soft delete a conversation (per-user) */
export const deleteConversation = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const member = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (!member) throw new Error("Not a member of this conversation");

    await ctx.db.patch(member._id, {
      isDeleted: true,
      deletedAt: Date.now(),
      unreadCount: 0,
    });
  },
});

/** Restore a deleted conversation (per-user) */
export const restoreConversation = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const member = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (!member) throw new Error("Not a member of this conversation");

    await ctx.db.patch(member._id, {
      isDeleted: false,
      deletedAt: undefined,
      isArchived: false,
    });
  },
});

/** Archive/unarchive conversation (per-user) */
export const toggleArchive = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const member = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (!member) throw new Error("Not a member of this conversation");

    const newArchived = !member.isArchived;
    await ctx.db.patch(member._id, { isArchived: newArchived });
    return newArchived;
  },
});

/** Toggle mute status */
export const toggleMute = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!member) throw new Error("Not a member of this conversation");

    await ctx.db.patch(member._id, { isMuted: !member.isMuted });
    return !member.isMuted;
  },
});

/** Get unread conversations */
export const getUnreadConversations = query({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("chatMembers")
      .filter((q) => q.and(
        q.eq(q.field("userId"), args.userId),
        q.eq(q.field("organizationId"), args.organizationId),
        q.gt(q.field("unreadCount"), 0)
      ))
      .collect();

    const activeMembers = members.filter((m) => !m.isDeleted && !m.isArchived);
    const convIds = activeMembers.map((m) => m.conversationId);
    return Promise.all(convIds.map((id) => ctx.db.get(id)));
  },
});
