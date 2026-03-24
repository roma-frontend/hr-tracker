/**
 * Chat Calls Module
 * 
 * Handles audio/video call functionality
 * Split from convex/chat.ts for better maintainability
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// ─── CALLS ────────────────────────────────────────────────────────────────────

/** Initiate a call */
export const initiateCall = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    initiatorId: v.id("users"),
    organizationId: v.id("organizations"),
    type: v.union(v.literal("audio"), v.literal("video")),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const members = await ctx.db
      .query("chatMembers")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const participantList = members
      .filter((m) => m.userId !== args.initiatorId)
      .map((m) => ({ userId: m.userId, joinedAt: null as number | null }));

    const now = Date.now();
    const callId = await ctx.db.insert("chatCalls", {
      conversationId: args.conversationId,
      organizationId: args.organizationId,
      initiatorId: args.initiatorId,
      type: args.type,
      status: "ringing",
      participants: participantList,
      createdAt: now,
    });

    const initiator = await ctx.db.get(args.initiatorId);
    await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      organizationId: args.organizationId,
      senderId: args.initiatorId,
      type: "call",
      content: `${initiator?.name ?? "Someone"} started a ${args.type} call`,
      callId,
      createdAt: now,
    });

    return callId;
  },
});

/** Join a call */
export const joinCall = mutation({
  args: {
    callId: v.id("chatCalls"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) throw new Error("Call not found");

    const participants = call.participants.map((p: any) => {
      if (p.userId === args.userId) {
        return { ...p, joinedAt: Date.now() };
      }
      return p;
    });

    await ctx.db.patch(args.callId, { participants });
  },
});

/** Leave a call */
export const leaveCall = mutation({
  args: {
    callId: v.id("chatCalls"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) throw new Error("Call not found");

    const participants = call.participants.map((p: any) => {
      if (p.userId === args.userId) {
        return { ...p, leftAt: Date.now() };
      }
      return p;
    });

    await ctx.db.patch(args.callId, { participants });
  },
});

/** End a call */
export const endCall = mutation({
  args: {
    callId: v.id("chatCalls"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) throw new Error("Call not found");
    if (call.initiatorId !== args.userId) throw new Error("Only initiator can end call");

    await ctx.db.patch(args.callId, {
      status: "ended",
      endedAt: Date.now(),
    });
  },
});

/** Get incoming calls for user */
export const getIncomingCalls = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allCalls = await ctx.db.query("chatCalls").collect();

    const incomingCalls = allCalls.filter((call) => {
      const isParticipant = call.participants.some((p: any) => p.userId === args.userId);
      const isInitiator = call.initiatorId === args.userId;
      const isRinging = call.status === "ringing";
      return isParticipant && !isInitiator && isRinging;
    });

    return incomingCalls;
  },
});

/** Get call history for conversation */
export const getCallHistory = query({
  args: { conversationId: v.id("chatConversations") },
  handler: async (ctx, args) => {
    const allCalls = await ctx.db.query("chatCalls").collect();
    return allCalls
      .filter((call) => call.conversationId === args.conversationId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 50);
  },
});
