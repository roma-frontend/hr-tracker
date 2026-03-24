/**
 * Chat Messages Module
 * 
 * Handles sending, editing, deleting messages
 * Split from convex/chat.ts for better maintainability
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

/** Send a message */
export const sendMessage = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    senderId: v.id("users"),
    organizationId: v.id("organizations"),
    content: v.string(),
    type: v.optional(v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("system"),
      v.literal("call")
    )),
    attachmentUrl: v.optional(v.string()),
    attachmentType: v.optional(v.string()),
    replyTo: v.optional(v.id("chatMessages")),
    mentionedUserIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const member = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.senderId)
      )
      .first();
    if (!member) throw new Error("Not a member of this conversation");

    const now = Date.now();
    const messageId = await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      organizationId: args.organizationId,
      senderId: args.senderId,
      content: args.content,
      type: args.type || "text",
      attachmentUrl: args.attachmentUrl,
      attachmentType: args.attachmentType,
      replyTo: args.replyTo,
      mentionedUserIds: args.mentionedUserIds,
      createdAt: now,
    });

    // Update conversation last message
    const preview = args.content.length > 100 ? args.content.slice(0, 100) + "…" : args.content;
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      lastMessageText: preview,
      lastMessageSenderId: args.senderId,
      updatedAt: now,
    });

    // Increment unread count for all other members
    const allMembers = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const m of allMembers) {
      if (m.userId !== args.senderId && !m.isMuted) {
        await ctx.db.patch(m._id, { unreadCount: (m.unreadCount || 0) + 1 });
      }
    }

    return messageId;
  },
});

/** Get messages for a conversation */
export const getMessages = query({
  args: {
    conversationId: v.id("chatConversations"),
    userId: v.id("users"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();
    if (!membership) return [];

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(args.limit);

    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const deletedForUsers: Id<"users">[] = (msg.deletedForUsers as Id<"users">[] | undefined) ?? [];
        if (deletedForUsers.includes(args.userId)) return null;

        const sender = await ctx.db.get(msg.senderId);
        return {
          ...msg,
          readBy: (msg.readBy as Array<{ userId: Id<"users">; readAt: number }> | undefined) ?? [],
          sender: sender ? {
            _id: sender._id,
            name: sender.name,
            avatarUrl: sender.avatarUrl,
          } : null,
        };
      })
    );

    return enriched.filter(Boolean).reverse();
  },
});

/** Edit a message */
export const editMessage = mutation({
  args: {
    messageId: v.id("chatMessages"),
    userId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.senderId !== args.userId) throw new Error("Not authorized");
    await ctx.db.patch(args.messageId, {
      content: args.content,
      isEdited: true,
      editedAt: Date.now(),
    });
  },
});

/** Delete message for everyone (sender only, within 5 minutes) */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("chatMessages"),
    userId: v.id("users"),
    deleteForEveryone: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const isSuperadmin = user.role === "superadmin";

    if (args.deleteForEveryone) {
      if (isSuperadmin) {
        await ctx.db.patch(args.messageId, {
          isDeleted: true,
          deletedAt: Date.now(),
          content: "This message was deleted",
        });
        return;
      }

      if (msg.senderId !== args.userId) throw new Error("Not authorized");

      const fiveMin = 5 * 60 * 1000;
      const timeSinceCreation = Date.now() - msg.createdAt;
      if (timeSinceCreation > fiveMin) throw new Error("Cannot delete after 5 minutes");

      await ctx.db.patch(args.messageId, {
        isDeleted: true,
        deletedAt: Date.now(),
        content: "This message was deleted",
      });
    } else {
      const existing: Id<"users">[] = (msg.deletedForUsers as Id<"users">[] | undefined) ?? [];
      if (!existing.includes(args.userId)) {
        await ctx.db.patch(args.messageId, {
          deletedForUsers: [...existing, args.userId],
        });
      }
    }
  },
});

/** Delete message for me only */
export const deleteMessageForMe = mutation({
  args: {
    messageId: v.id("chatMessages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");
    const existing: Id<"users">[] = (msg.deletedForUsers as Id<"users">[] | undefined) ?? [];
    if (!existing.includes(args.userId)) {
      await ctx.db.patch(args.messageId, {
        deletedForUsers: [...existing, args.userId],
      });
    }
  },
});

/** Toggle reaction on message */
export const toggleReaction = mutation({
  args: {
    messageId: v.id("chatMessages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");

    const reactions = { ...(msg.reactions as Record<string, Id<"users">[]> || {}) };

    // Convert emoji to ASCII-safe key
    const emojiKey = Array.from(args.emoji).map(char => 'u' + char.codePointAt(0)!.toString(16)).join('_');

    const users = reactions[emojiKey] ?? [];
    const idx = users.indexOf(args.userId);

    if (idx >= 0) {
      users.splice(idx, 1);
    } else {
      users.push(args.userId);
    }

    if (users.length === 0) {
      delete reactions[emojiKey];
    } else {
      reactions[emojiKey] = users;
    }

    await ctx.db.patch(args.messageId, { reactions });
  },
});

/** Mark conversation as read */
export const markAsRead = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();
    if (member) {
      await ctx.db.patch(member._id, { unreadCount: 0 });
    }
  },
});

/** Search messages in a conversation */
export const searchMessages = query({
  args: {
    conversationId: v.id("chatConversations"),
    userId: v.id("users"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();
    if (!membership) return [];

    const allMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const queryLower = args.query.toLowerCase();
    const filtered = allMessages.filter((msg) =>
      msg.content.toLowerCase().includes(queryLower)
    );

    return filtered.slice(0, 50);
  },
});

/** Get pinned messages */
export const getPinnedMessages = query({
  args: { conversationId: v.id("chatConversations") },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    return allMessages.filter((msg) => msg.isPinned);
  },
});

/** Toggle pin on message */
export const togglePinMessage = mutation({
  args: {
    messageId: v.id("chatMessages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");

    const member = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", msg.conversationId).eq("userId", args.userId)
      )
      .first();
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.messageId, { isPinned: !msg.isPinned });
    return !msg.isPinned;
  },
});
