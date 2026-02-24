import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// ── Get all leaves with user info ──────────────────────────────────────────
export const getAllLeaves = query({
  args: {},
  handler: async (ctx) => {
    const leaves = await ctx.db.query("leaveRequests").order("desc").collect();
    return await Promise.all(
      leaves.map(async (leave) => {
        const user = await ctx.db.get(leave.userId);
        const reviewer = leave.reviewedBy ? await ctx.db.get(leave.reviewedBy) : null;
        return {
          ...leave,
          userName: user?.name ?? "Unknown",
          userEmail: user?.email ?? "",
          userDepartment: user?.department ?? "",
          userEmployeeType: user?.employeeType ?? "staff",
          userAvatarUrl: user?.avatarUrl,
          reviewerName: reviewer?.name,
        };
      })
    );
  },
});

// ── Get leaves for a specific user ────────────────────────────────────────
export const getUserLeaves = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("leaveRequests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ── Get pending leaves (for admin/supervisor) ──────────────────────────────
export const getPendingLeaves = query({
  args: {},
  handler: async (ctx) => {
    const leaves = await ctx.db
      .query("leaveRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return await Promise.all(
      leaves.map(async (leave) => {
        const user = await ctx.db.get(leave.userId);
        return {
          ...leave,
          userName: user?.name ?? "Unknown",
          userEmail: user?.email ?? "",
          userDepartment: user?.department ?? "",
          userAvatarUrl: user?.avatarUrl,
        };
      })
    );
  },
});

// ── Create leave request ───────────────────────────────────────────────────
export const createLeave = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("paid"),
      v.literal("unpaid"),
      v.literal("sick"),
      v.literal("family"),
      v.literal("doctor")
    ),
    startDate: v.string(),
    endDate: v.string(),
    days: v.number(),
    reason: v.string(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const leaveId = await ctx.db.insert("leaveRequests", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Notify ALL admins and supervisors
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    const supervisors = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "supervisor"))
      .collect();

    const notifyUsers = [...admins, ...supervisors];

    for (const admin of notifyUsers) {
      if (admin._id === args.userId) continue;
      await ctx.db.insert("notifications", {
        userId: admin._id,
        type: "leave_request",
        title: "🏖 New Leave Request",
        message: `${user.name} requested ${args.days} day(s) of ${args.type} leave (${args.startDate} → ${args.endDate})`,
        isRead: false,
        relatedId: leaveId,
        createdAt: Date.now(),
      });
    }

    // Create SLA metric for tracking
    await ctx.db.insert("slaMetrics", {
      leaveRequestId: leaveId,
      submittedAt: Date.now(),
      targetResponseTime: 24, // Will be updated from config if exists
      status: "pending",
      warningTriggered: false,
      criticalTriggered: false,
      createdAt: Date.now(),
    });

    return leaveId;
  },
});

// ── Approve leave ──────────────────────────────────────────────────────────
export const approveLeave = mutation({
  args: {
    leaveId: v.id("leaveRequests"),
    reviewerId: v.id("users"),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, { leaveId, reviewerId, comment }) => {
    const leave = await ctx.db.get(leaveId);
    if (!leave) throw new Error("Leave request not found");
    if (leave.status !== "pending") throw new Error("Leave is not pending");

    await ctx.db.patch(leaveId, {
      status: "approved",
      reviewedBy: reviewerId,
      reviewComment: comment,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });

    const reviewer = await ctx.db.get(reviewerId);

    // Notify the employee
    await ctx.db.insert("notifications", {
      userId: leave.userId,
      type: "leave_approved",
      title: "✅ Leave Approved!",
      message: `Your ${leave.type} leave request (${leave.startDate} → ${leave.endDate}) has been approved by ${reviewer?.name ?? "Admin"}.${comment ? ` Note: ${comment}` : ""}`,
      isRead: false,
      relatedId: leaveId,
      createdAt: Date.now(),
    });

    // Deduct from balance
    const user = await ctx.db.get(leave.userId);
    if (user) {
      if (leave.type === "paid") {
        await ctx.db.patch(leave.userId, {
          paidLeaveBalance: Math.max(0, (user.paidLeaveBalance ?? 24) - leave.days),
        });
      } else if (leave.type === "sick") {
        await ctx.db.patch(leave.userId, {
          sickLeaveBalance: Math.max(0, (user.sickLeaveBalance ?? 10) - leave.days),
        });
      } else if (leave.type === "family") {
        await ctx.db.patch(leave.userId, {
          familyLeaveBalance: Math.max(0, (user.familyLeaveBalance ?? 5) - leave.days),
        });
      }
    }

    // Update SLA metric
    const metric = await ctx.db
      .query("slaMetrics")
      .withIndex("by_leave", (q) => q.eq("leaveRequestId", leaveId))
      .first();
    
    if (metric && leave.reviewedAt) {
      const responseTimeHours = (leave.reviewedAt - metric.submittedAt) / (1000 * 60 * 60);
      const slaScore = responseTimeHours <= metric.targetResponseTime 
        ? Math.max(80, 100 - ((responseTimeHours / metric.targetResponseTime) * 20))
        : Math.max(0, 79 - (((responseTimeHours - metric.targetResponseTime) / metric.targetResponseTime) * 40));
      
      await ctx.db.patch(metric._id, {
        respondedAt: leave.reviewedAt,
        responseTimeHours: Math.round(responseTimeHours * 10) / 10,
        slaScore: Math.round(slaScore * 10) / 10,
        status: responseTimeHours <= metric.targetResponseTime ? "on_time" : "breached",
      });
    }

    return leaveId;
  },
});

// ── Reject leave ───────────────────────────────────────────────────────────
export const rejectLeave = mutation({
  args: {
    leaveId: v.id("leaveRequests"),
    reviewerId: v.id("users"),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, { leaveId, reviewerId, comment }) => {
    const leave = await ctx.db.get(leaveId);
    if (!leave) throw new Error("Leave request not found");
    if (leave.status !== "pending") throw new Error("Leave is not pending");

    await ctx.db.patch(leaveId, {
      status: "rejected",
      reviewedBy: reviewerId,
      reviewComment: comment,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });

    const reviewer = await ctx.db.get(reviewerId);

    // Notify the employee
    await ctx.db.insert("notifications", {
      userId: leave.userId,
      type: "leave_rejected",
      title: "❌ Leave Rejected",
      message: `Your ${leave.type} leave request (${leave.startDate} → ${leave.endDate}) has been rejected by ${reviewer?.name ?? "Admin"}.${comment ? ` Reason: ${comment}` : ""}`,
      isRead: false,
      relatedId: leaveId,
      createdAt: Date.now(),
    });

    // Update SLA metric
    const metric = await ctx.db
      .query("slaMetrics")
      .withIndex("by_leave", (q) => q.eq("leaveRequestId", leaveId))
      .first();
    
    if (metric && leave.reviewedAt) {
      const responseTimeHours = (leave.reviewedAt - metric.submittedAt) / (1000 * 60 * 60);
      const slaScore = responseTimeHours <= metric.targetResponseTime 
        ? Math.max(80, 100 - ((responseTimeHours / metric.targetResponseTime) * 20))
        : Math.max(0, 79 - (((responseTimeHours - metric.targetResponseTime) / metric.targetResponseTime) * 40));
      
      await ctx.db.patch(metric._id, {
        respondedAt: leave.reviewedAt,
        responseTimeHours: Math.round(responseTimeHours * 10) / 10,
        slaScore: Math.round(slaScore * 10) / 10,
        status: responseTimeHours <= metric.targetResponseTime ? "on_time" : "breached",
      });
    }

    return leaveId;
  },
});

// ── Delete leave ───────────────────────────────────────────────────────────
export const deleteLeave = mutation({
  args: { leaveId: v.id("leaveRequests") },
  handler: async (ctx, { leaveId }) => {
    await ctx.db.delete(leaveId);
    return leaveId;
  },
});

// ── Get leave stats ────────────────────────────────────────────────────────
export const getLeaveStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("leaveRequests").collect();
    const pending = all.filter((l) => l.status === "pending").length;
    const approved = all.filter((l) => l.status === "approved").length;
    const rejected = all.filter((l) => l.status === "rejected").length;
    const today = new Date().toISOString().split("T")[0];
    const onLeaveToday = all.filter(
      (l) => l.status === "approved" && l.startDate <= today && l.endDate >= today
    ).length;
    return { total: all.length, pending, approved, rejected, onLeaveToday };
  },
});
