import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("supervisor"), v.literal("employee")),
    employeeType: v.union(v.literal("staff"), v.literal("contractor")),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    supervisorId: v.optional(v.id("users")),
    isActive: v.boolean(),
    // New user approval system
    isApproved: v.boolean(),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    // Travel allowance: contractor=12000, staff=20000
    travelAllowance: v.number(),
    // Annual leave balances
    paidLeaveBalance: v.number(),
    sickLeaveBalance: v.number(),
    familyLeaveBalance: v.number(),
    // WebAuthn
    webauthnChallenge: v.optional(v.string()),
    // Face Recognition
    faceDescriptor: v.optional(v.array(v.number())), // 128-dimensional face embedding
    faceImageUrl: v.optional(v.string()), // Reference image for face
    faceRegisteredAt: v.optional(v.number()),
    // Sessions
    sessionToken: v.optional(v.string()),
    sessionExpiry: v.optional(v.number()),
    // Metadata
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_supervisor", ["supervisorId"])
    .index("by_approval", ["isApproved"]),

  webauthnCredentials: defineTable({
    userId: v.id("users"),
    credentialId: v.string(),
    publicKey: v.string(),
    counter: v.number(),
    deviceName: v.optional(v.string()),
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_credential_id", ["credentialId"]),

  leaveRequests: defineTable({
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
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    reviewedBy: v.optional(v.id("users")),
    reviewComment: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("leave_request"),
      v.literal("leave_approved"),
      v.literal("leave_rejected"),
      v.literal("employee_added"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),

  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    target: v.optional(v.string()),
    details: v.optional(v.string()),
    ip: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
