/**
 * 🔍 SUPERADMIN: Global Search
 * Search across all tables: users, organizations, leaves, tasks, drivers, tickets
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ─── USER 360 PROFILE ────────────────────────────────────────────────────────
/**
 * Get complete 360° view of a user
 * All data related to a single user in one place
 */
export const getUser360 = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Parallel fetch all related data
    const [
      leaves,
      tasks,
      driverRequests,
      notifications,
      loginAttempts,
      supportTickets,
      ticketComments,
      chatMessages,
      org,
    ] = await Promise.all([
      // Leave requests
      ctx.db
        .query("leaveRequests")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect(),
      
      // Tasks (assigned to user)
      ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("assignedTo"), args.userId))
        .collect(),
      
      // Driver requests
      ctx.db
        .query("driverRequests")
        .withIndex("by_requester", (q) => q.eq("requesterId", args.userId))
        .collect(),
      
      // Notifications (last 50)
      ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(50),
      
      // Login attempts (last 20)
      ctx.db
        .query("loginAttempts")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .order("desc")
        .take(20),
      
      // Support tickets (created or assigned)
      ctx.db
        .query("supportTickets")
        .filter((q) => 
          q.or(
            q.eq(q.field("createdBy"), args.userId),
            q.eq(q.field("assignedTo"), args.userId)
          )
        )
        .collect(),
      
      // Ticket comments
      ctx.db
        .query("ticketComments")
        .filter((q) => q.eq(q.field("authorId"), args.userId))
        .collect(),
      
      // Chat messages (last 100)
      ctx.db
        .query("chatMessages")
        .filter((q) => q.eq(q.field("senderId"), args.userId))
        .order("desc")
        .take(100),
      
      // Organization
      user.organizationId ? ctx.db.get(user.organizationId) : null,
    ]);

    // Enrich leaves with reviewer info
    const enrichedLeaves = await Promise.all(
      leaves.map(async (leave) => {
        const reviewer = leave.reviewedBy ? await ctx.db.get(leave.reviewedBy) : null;
        return {
          ...leave,
          reviewerName: reviewer?.name || null,
        };
      })
    );

    // Enrich tasks with creator info
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const creator = task.createdBy ? await ctx.db.get(task.createdBy) : null;
        return {
          ...task,
          creatorName: creator?.name || null,
        };
      })
    );

    // Enrich driver requests with driver info
    const enrichedDriverRequests = await Promise.all(
      driverRequests.map(async (req) => {
        const driver = await ctx.db.get(req.driverId);
        return {
          ...req,
          driverName: driver?.name || null,
          driverPhone: driver?.phone || null,
        };
      })
    );

    // Enrich support tickets
    const enrichedTickets = await Promise.all(
      supportTickets.map(async (ticket) => {
        const assignee = ticket.assignedTo ? await ctx.db.get(ticket.assignedTo) : null;
        return {
          ...ticket,
          assigneeName: assignee?.name || null,
        };
      })
    );

    // Calculate statistics
    const stats = {
      totalLeaves: leaves.length,
      pendingLeaves: leaves.filter((l) => l.status === "pending").length,
      approvedLeaves: leaves.filter((l) => l.status === "approved").length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      totalDriverRequests: driverRequests.length,
      totalTickets: supportTickets.length,
      openTickets: supportTickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length,
      totalLoginAttempts: loginAttempts.length,
      failedLoginAttempts: loginAttempts.filter((l) => !l.success).length,
    };

    return {
      user,
      organization: org,
      leaves: enrichedLeaves.sort((a, b) => b.createdAt - a.createdAt),
      tasks: enrichedTasks.sort((a, b) => b.createdAt - a.createdAt),
      driverRequests: enrichedDriverRequests.sort((a, b) => b.startTime - a.startTime),
      notifications,
      loginAttempts,
      supportTickets: enrichedTickets.sort((a, b) => b.createdAt - a.createdAt),
      ticketComments: ticketComments.sort((a, b) => b.createdAt - a.createdAt),
      chatMessages: chatMessages.sort((a, b) => b.createdAt - a.createdAt),
      stats,
    };
  },
});

// ─── EMERGENCY DASHBOARD ─────────────────────────────────────────────────────
/**
 * 🚨 Emergency Dashboard - Critical issues requiring immediate attention
 */
export const getEmergencyDashboard = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const twentyFourHoursAgo = now - 86400000;

    // Parallel fetch all critical data
    const [
      criticalTickets,
      activeIncidents,
      slaBreaches,
      failedLogins,
      systemAlerts,
      pendingOrgRequests,
    ] = await Promise.all([
      // Critical tickets in last hour
      ctx.db
        .query("supportTickets")
        .filter((q) =>
          q.and(
            q.eq(q.field("priority"), "critical"),
            q.neq(q.field("status"), "closed"),
            q.gt(q.field("createdAt"), oneHourAgo)
          )
        )
        .collect(),
      
      // Active emergency incidents
      ctx.db
        .query("emergencyIncidents")
        .filter((q) => q.eq(q.field("status"), "investigating"))
        .collect(),
      
      // SLA breaches in last 24h
      ctx.db
        .query("slaMetrics")
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "breached"),
            q.gt(q.field("createdAt"), twentyFourHoursAgo)
          )
        )
        .collect(),
      
      // Failed login attempts (potential attack)
      ctx.db
        .query("loginAttempts")
        .filter((q) =>
          q.and(
            q.eq(q.field("success"), false),
            q.gt(q.field("createdAt"), oneHourAgo)
          )
        )
        .collect(),
      
      // Organizations in maintenance mode
      ctx.db
        .query("maintenanceMode")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect(),
      
      // Pending organization requests
      ctx.db
        .query("organizationRequests")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .collect(),
    ]);

    // Enrich critical tickets
    const enrichedTickets = await Promise.all(
      criticalTickets.map(async (ticket) => {
        const creator = await ctx.db.get(ticket.createdBy);
        const org = ticket.organizationId ? await ctx.db.get(ticket.organizationId) : null;
        return {
          ...ticket,
          creatorName: creator?.name || "Unknown",
          organizationName: org?.name || null,
          minutesOpen: Math.round((now - ticket.createdAt) / 60000),
        };
      })
    );

    // Enrich incidents
    const enrichedIncidents = await Promise.all(
      activeIncidents.map(async (incident) => {
        const creator = await ctx.db.get(incident.createdBy);
        return {
          ...incident,
          creatorName: creator?.name || "Unknown",
          minutesActive: Math.round((now - incident.startedAt) / 60000),
        };
      })
    );

    // Analyze failed logins for potential attacks
    const failedLoginsByIP = failedLogins.reduce((acc, attempt) => {
      const ip = attempt.ipAddress || "unknown";
      if (!acc[ip]) acc[ip] = [];
      acc[ip].push(attempt);
      return acc;
    }, {} as Record<string, any[]>);

    const suspiciousIPs = Object.entries(failedLoginsByIP)
      .filter(([_, attempts]) => attempts.length >= 5)
      .map(([ip, attempts]) => ({
        ip,
        attempts: attempts.length,
        userIds: [...new Set(attempts.map((a) => a.userId.toString()))],
      }));

    // Calculate priority score
    let priorityScore = 0;
    const issues: string[] = [];

    if (enrichedTickets.length > 0) {
      priorityScore += enrichedTickets.length * 10;
      issues.push(`${enrichedTickets.length} критических тикетов`);
    }

    if (enrichedIncidents.length > 0) {
      priorityScore += enrichedIncidents.length * 20;
      issues.push(`${enrichedIncidents.length} активных инцидента`);
    }

    if (slaBreaches.length > 10) {
      priorityScore += 15;
      issues.push(`${slaBreaches.length} SLA нарушений за 24ч`);
    }

    if (suspiciousIPs.length > 0) {
      priorityScore += suspiciousIPs.length * 5;
      issues.push(`${suspiciousIPs.length} подозрительных IP`);
    }

    let priorityLevel: "low" | "medium" | "high" | "critical" = "low";
    if (priorityScore >= 50) priorityLevel = "critical";
    else if (priorityScore >= 30) priorityLevel = "high";
    else if (priorityScore >= 10) priorityLevel = "medium";

    return {
      criticalTickets: enrichedTickets,
      activeIncidents: enrichedIncidents,
      slaBreaches: slaBreaches.length,
      suspiciousIPs,
      maintenanceModeOrgs: systemAlerts.length,
      pendingOrgRequests: pendingOrgRequests.length,
      priorityLevel,
      priorityScore,
      issues,
      requiresAttention: priorityScore > 0,
    };
  },
});

// ─── CREATE EMERGENCY INCIDENT ───────────────────────────────────────────────
export const createIncident = mutation({
  args: {
    createdBy: v.id("users"),
    title: v.string(),
    description: v.string(),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    affectedUsers: v.number(),
    affectedOrgs: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const incidentId = await ctx.db.insert("emergencyIncidents", {
      organizationId: undefined,
      title: args.title,
      description: args.description,
      severity: args.severity,
      status: "investigating",
      affectedUsers: args.affectedUsers,
      affectedOrgs: args.affectedOrgs,
      rootCause: undefined,
      resolution: undefined,
      startedAt: now,
      resolvedAt: undefined,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    // Notify all superadmins
    const superadmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "superadmin"))
      .collect();

    for (const admin of superadmins) {
      await ctx.db.insert("notifications", {
        organizationId: undefined,
        userId: admin._id,
        type: "security_alert",
        title: `🚨 Чрезвычайная ситуация: ${args.severity}`,
        message: args.title,
        isRead: false,
        relatedId: `incident:${incidentId}`,
        createdAt: now,
      });
    }

    return incidentId;
  },
});

// ─── UPDATE INCIDENT STATUS ──────────────────────────────────────────────────
export const updateIncidentStatus = mutation({
  args: {
    incidentId: v.id("emergencyIncidents"),
    status: v.union(
      v.literal("investigating"),
      v.literal("identified"),
      v.literal("monitoring"),
      v.literal("resolved")
    ),
    userId: v.id("users"),
    rootCause: v.optional(v.string()),
    resolution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const updates: any = {
      status: args.status,
      updatedAt: now,
    };

    if (args.rootCause) updates.rootCause = args.rootCause;
    if (args.resolution) updates.resolution = args.resolution;
    if (args.status === "resolved") {
      updates.resolvedAt = now;
    }

    await ctx.db.patch(args.incidentId, updates);

    return args.incidentId;
  },
});

// ─── IMPERSONATION ───────────────────────────────────────────────────────────
/**
 * 👤 Start impersonation session
 * Superadmin can temporarily act as another user
 */
export const startImpersonation = mutation({
  args: {
    superadminId: v.id("users"),
    targetUserId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 3600000; // 1 hour

    // Verify superadmin
    const superadmin = await ctx.db.get(args.superadminId);
    if (!superadmin || superadmin.role !== "superadmin") {
      throw new Error("Only superadmin can impersonate users");
    }

    // Get target user
    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    // Get target user's organization
    if (!targetUser.organizationId) {
      throw new Error("Target user has no organization");
    }

    // Generate unique token
    const token = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Create impersonation session
    const sessionId = await ctx.db.insert("impersonationSessions", {
      superadminId: args.superadminId,
      targetUserId: args.targetUserId,
      organizationId: targetUser.organizationId,
      reason: args.reason,
      token,
      expiresAt,
      startedAt: now,
      endedAt: undefined,
      isActive: true,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      organizationId: targetUser.organizationId,
      userId: args.superadminId,
      action: "IMPERSONATE_USER",
      target: args.targetUserId,
      details: JSON.stringify({
        reason: args.reason,
        targetEmail: targetUser.email,
        targetName: targetUser.name,
        sessionId,
        expiresAt,
      }),
      createdAt: now,
    });

    // Notify target user
    await ctx.db.insert("notifications", {
      organizationId: targetUser.organizationId,
      userId: args.targetUserId,
      type: "security_alert",
      title: "👤 Superadmin impersonation",
      message: `${superadmin.name} has started an impersonation session on your account. Reason: ${args.reason}`,
      isRead: false,
      relatedId: `impersonation:${sessionId}`,
      createdAt: now,
    });

    return {
      sessionId,
      token,
      expiresAt,
      targetUser: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        organizationId: targetUser.organizationId,
      },
    };
  },
});

/**
 * End impersonation session
 */
export const endImpersonation = mutation({
  args: {
    sessionId: v.id("impersonationSessions"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.superadminId !== args.userId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();

    await ctx.db.patch(args.sessionId, {
      isActive: false,
      endedAt: now,
      updatedAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      organizationId: session.organizationId,
      userId: args.userId,
      action: "END_IMPERSONATION",
      target: session.targetUserId,
      details: JSON.stringify({
        sessionId: args.sessionId,
        duration: now - session.startedAt,
      }),
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Get active impersonation session for user
 */
export const getActiveImpersonation = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("impersonationSessions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.eq(q.field("targetUserId"), args.userId))
      .collect();

    if (sessions.length === 0) return null;

    const session = sessions[0];
    const superadmin = await ctx.db.get(session.superadminId);
    const targetUser = await ctx.db.get(session.targetUserId);

    return {
      sessionId: session._id,
      superadminName: superadmin?.name || "Unknown",
      superadminEmail: superadmin?.email || "",
      targetUser: targetUser ? {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
      } : null,
      reason: session.reason,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
    };
  },
});

/**
 * Get all impersonation sessions (for audit)
 */
export const getImpersonationHistory = query({
  args: {
    superadminId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let sessions = await ctx.db
      .query("impersonationSessions")
      .order("desc")
      .collect();

    if (args.superadminId) {
      sessions = sessions.filter((s) => s.superadminId === args.superadminId);
    }

    if (args.limit) {
      sessions = sessions.slice(0, args.limit);
    }

    // Enrich with user data
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const superadmin = await ctx.db.get(session.superadminId);
        const targetUser = await ctx.db.get(session.targetUserId);
        const org = await ctx.db.get(session.organizationId);

        return {
          ...session,
          superadminName: superadmin?.name || "Unknown",
          superadminEmail: superadmin?.email || "",
          targetUserName: targetUser?.name || "Unknown",
          targetUserEmail: targetUser?.email || "",
          organizationName: org?.name || null,
          duration: session.endedAt ? session.endedAt - session.startedAt : null,
        };
      })
    );

    return enrichedSessions;
  },
});

// ─── GLOBAL SEARCH ───────────────────────────────────────────────────────────
export const globalSearch = query({
  args: { 
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase().trim();
    const limit = args.limit || 10;

    if (searchQuery.length < 2) {
      return {
        users: [],
        organizations: [],
        leaveRequests: [],
        driverRequests: [],
        tasks: [],
        supportTickets: [],
        total: 0,
      };
    }

    // Parallel search across all tables
    const [
      users,
      organizations,
      leaveRequests,
      driverRequests,
      tasks,
      supportTickets,
    ] = await Promise.all([
      // Search users by email and name
      ctx.db
        .query("users")
        .withIndex("by_email")
        .filter((q) => q.eq(q.field("email"), searchQuery))
        .collect(),
      
      // Search organizations by slug and name
      ctx.db
        .query("organizations")
        .withIndex("by_slug")
        .filter((q) => q.eq(q.field("slug"), searchQuery))
        .collect(),
      
      // Search leave requests
      ctx.db
        .query("leaveRequests")
        .withIndex("by_status")
        .collect(),
      
      // Search driver requests
      ctx.db
        .query("driverRequests")
        .collect(),
      
      // Search tasks
      ctx.db
        .query("tasks")
        .collect(),
      
      // Search support tickets
      ctx.db
        .query("supportTickets")
        .withIndex("by_ticket_number")
        .filter((q) => q.eq(q.field("ticketNumber"), args.query))
        .collect(),
    ]);

    // Filter and enrich results
    const filteredUsers = users
      .filter((u) => 
        u.email.toLowerCase().includes(searchQuery) ||
        u.name.toLowerCase().includes(searchQuery)
      )
      .slice(0, limit);

    const filteredOrgs = organizations
      .filter((o) => 
        o.name.toLowerCase().includes(searchQuery) ||
        o.slug.toLowerCase().includes(searchQuery)
      )
      .slice(0, limit);

    // Enrich leave requests with user data
    const enrichedLeaves = await Promise.all(
      leaveRequests
        .filter((l) => {
          const startDate = l.startDate.includes(searchQuery);
          const endDate = l.endDate.includes(searchQuery);
          return startDate || endDate;
        })
        .slice(0, limit)
        .map(async (leave) => {
          const user = await ctx.db.get(leave.userId);
          return {
            ...leave,
            userName: user?.name || "Unknown",
            userEmail: user?.email || "",
            userAvatar: user?.avatarUrl,
          };
        })
    );

    // Enrich driver requests
    const enrichedDrivers = await Promise.all(
      driverRequests
        .filter((d) => {
          const from = d.tripInfo?.from?.toLowerCase().includes(searchQuery);
          const to = d.tripInfo?.to?.toLowerCase().includes(searchQuery);
          const purpose = d.tripInfo?.purpose?.toLowerCase().includes(searchQuery);
          return from || to || purpose;
        })
        .slice(0, limit)
        .map(async (request) => {
          const requester = await ctx.db.get(request.requesterId);
          const driver = await ctx.db.get(request.driverId);
          return {
            ...request,
            requesterName: requester?.name || "Unknown",
            requesterEmail: requester?.email || "",
            driverName: driver?.name || "Unknown",
          };
        })
    );

    // Enrich tasks
    const enrichedTasks = await Promise.all(
      tasks
        .filter((t) => 
          t.title.toLowerCase().includes(searchQuery) ||
          t.description?.toLowerCase().includes(searchQuery)
        )
        .slice(0, limit)
        .map(async (task) => {
          const assignee = task.assignedTo ? await ctx.db.get(task.assignedTo) : null;
          const creator = task.createdBy ? await ctx.db.get(task.createdBy) : null;
          return {
            ...task,
            assigneeName: assignee?.name || "Unknown",
            creatorName: creator?.name || "Unknown",
          };
        })
    );

    // Enrich tickets
    const enrichedTickets = await Promise.all(
      supportTickets
        .filter((t) => 
          t.title.toLowerCase().includes(searchQuery) ||
          t.description.toLowerCase().includes(searchQuery) ||
          t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, limit)
        .map(async (ticket) => {
          const creator = await ctx.db.get(ticket.createdBy);
          const assignee = ticket.assignedTo ? await ctx.db.get(ticket.assignedTo) : null;
          return {
            ...ticket,
            creatorName: creator?.name || "Unknown",
            creatorEmail: creator?.email || "",
            assigneeName: assignee?.name || null,
          };
        })
    );

    return {
      users: filteredUsers,
      organizations: filteredOrgs,
      leaveRequests: enrichedLeaves,
      driverRequests: enrichedDrivers,
      tasks: enrichedTasks,
      supportTickets: enrichedTickets,
      total:
        filteredUsers.length +
        filteredOrgs.length +
        enrichedLeaves.length +
        enrichedDrivers.length +
        enrichedTasks.length +
        enrichedTickets.length,
    };
  },
});

/**
 * Quick search for Command Palette (Cmd+K)
 * Returns top 5 results for each category
 */
export const quickSearch = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const fullResults = await globalSearch(ctx, { query: args.query, limit: 5 });
    
    // Format for quick display
    return {
      users: fullResults.users.map((u: any) => ({
        id: u._id,
        type: "user" as const,
        title: u.name,
        subtitle: u.email,
        organization: u.organizationId,
        icon: "👤",
      })),
      organizations: fullResults.organizations.map((o: any) => ({
        id: o._id,
        type: "organization" as const,
        title: o.name,
        subtitle: `${o.plan} • ${o.slug}`,
        icon: "🏢",
      })),
      leaveRequests: fullResults.leaveRequests.map((l: any) => ({
        id: l._id,
        type: "leave" as const,
        title: `${l.userName} - ${l.type}`,
        subtitle: `${l.startDate} → ${l.endDate} • ${l.status}`,
        icon: "📅",
      })),
      tasks: fullResults.tasks.map((t: any) => ({
        id: t._id,
        type: "task" as const,
        title: t.title,
        subtitle: `${t.status} • ${t.priority}`,
        icon: "✅",
      })),
      tickets: fullResults.supportTickets.map((t: any) => ({
        id: t._id,
        type: "ticket" as const,
        title: t.ticketNumber,
        subtitle: t.title,
        icon: "🎫",
      })),
    };
  },
});

/**
 * Search users by email prefix (for typeahead)
 */
export const searchUsersByPrefix = query({
  args: { prefix: v.string(), organizationId: v.optional(v.id("organizations")) },
  handler: async (ctx, args) => {
    const prefix = args.prefix.toLowerCase();
    
    if (args.organizationId) {
      const users = await ctx.db
        .query("users")
        .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
        .collect();
      
      return users
        .filter((u) => u.email.toLowerCase().startsWith(prefix) || u.name.toLowerCase().startsWith(prefix))
        .slice(0, 10)
        .map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatarUrl: u.avatarUrl,
        }));
    } else {
      // Global search for superadmin
      const allUsers = await ctx.db.query("users").collect();
      
      return allUsers
        .filter((u) => u.email.toLowerCase().startsWith(prefix) || u.name.toLowerCase().startsWith(prefix))
        .slice(0, 10)
        .map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          organizationId: u.organizationId,
          avatarUrl: u.avatarUrl,
        }));
    }
  },
});
