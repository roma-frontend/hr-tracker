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
    presenceStatus: v.optional(v.union(
      v.literal("available"),
      v.literal("in_meeting"),
      v.literal("in_call"),
      v.literal("out_of_office"),
      v.literal("busy"),
    )),
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
    // Password Reset
    resetPasswordToken: v.optional(v.string()),
    resetPasswordExpiry: v.optional(v.number()),
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

  // SLA Configuration
  slaConfig: defineTable({
    // SLA targets in hours
    targetResponseTime: v.number(), // e.g., 24 hours
    warningThreshold: v.number(), // e.g., 18 hours (75% of target)
    criticalThreshold: v.number(), // e.g., 22 hours (90% of target)
    // Business hours configuration
    businessHoursOnly: v.boolean(),
    businessStartHour: v.number(), // e.g., 9
    businessEndHour: v.number(), // e.g., 17
    excludeWeekends: v.boolean(),
    // Notification settings
    notifyOnWarning: v.boolean(),
    notifyOnCritical: v.boolean(),
    notifyOnBreach: v.boolean(),
    // Metadata
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }),

  // SLA Metrics History
  slaMetrics: defineTable({
    leaveRequestId: v.id("leaveRequests"),
    submittedAt: v.number(),
    respondedAt: v.optional(v.number()),
    responseTimeHours: v.optional(v.number()),
    targetResponseTime: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("on_time"),
      v.literal("breached")
    ),
    slaScore: v.optional(v.number()),
    warningTriggered: v.boolean(),
    criticalTriggered: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_leave", ["leaveRequestId"])
    .index("by_status", ["status"])
    .index("by_submitted", ["submittedAt"]),

  // Employee Profiles
  employeeProfiles: defineTable({
    userId: v.id("users"),
    biography: v.optional(v.object({
      education: v.optional(v.array(v.string())),
      certifications: v.optional(v.array(v.string())),
      workHistory: v.optional(v.array(v.string())),
      skills: v.optional(v.array(v.string())),
      languages: v.optional(v.array(v.string())),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Employee Documents
  employeeDocuments: defineTable({
    userId: v.id("users"),
    uploaderId: v.id("users"),
    category: v.union(
      v.literal("resume"),
      v.literal("contract"),
      v.literal("certificate"),
      v.literal("performance_review"),
      v.literal("id_document"),
      v.literal("other")
    ),
    fileName: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    description: v.optional(v.string()),
    uploadedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Employee Notes (Manager feedback)
  employeeNotes: defineTable({
    employeeId: v.id("users"),
    authorId: v.id("users"),
    type: v.union(
      v.literal("performance"),
      v.literal("behavior"),
      v.literal("achievement"),
      v.literal("concern"),
      v.literal("general")
    ),
    visibility: v.union(
      v.literal("private"),
      v.literal("hr_only"),
      v.literal("manager_only"),
      v.literal("employee_visible")
    ),
    content: v.string(),
    sentiment: v.union(
      v.literal("positive"),
      v.literal("neutral"),
      v.literal("negative")
    ),
    tags: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_author", ["authorId"]),

  // Performance Metrics
  performanceMetrics: defineTable({
    userId: v.id("users"),
    updatedBy: v.id("users"),
    // Attendance metrics
    punctualityScore: v.number(),
    absenceRate: v.number(),
    lateArrivals: v.number(),
    // Performance metrics
    kpiScore: v.number(),
    projectCompletion: v.number(),
    deadlineAdherence: v.number(),
    // Collaboration metrics
    teamworkRating: v.number(),
    communicationScore: v.number(),
    conflictIncidents: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Time Tracking (Check-In/Check-Out)
  timeTracking: defineTable({
    userId: v.id("users"),
    checkInTime: v.number(), // timestamp when employee arrived
    checkOutTime: v.optional(v.number()), // timestamp when employee left
    scheduledStartTime: v.number(), // 9:00 AM in timestamp
    scheduledEndTime: v.number(), // 6:00 PM in timestamp
    // Calculated fields
    isLate: v.boolean(), // arrived after 9:00
    lateMinutes: v.optional(v.number()), // how many minutes late
    isEarlyLeave: v.boolean(), // left before 18:00
    earlyLeaveMinutes: v.optional(v.number()), // how many minutes early
    overtimeMinutes: v.optional(v.number()), // worked extra hours
    totalWorkedMinutes: v.optional(v.number()), // total time worked
    status: v.union(
      v.literal("checked_in"), // currently at work
      v.literal("checked_out"), // finished for the day
      v.literal("absent") // didn't show up
    ),
    date: v.string(), // "2026-02-24" for easy querying by day
    notes: v.optional(v.string()), // any notes about the day
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"])
    .index("by_user_date", ["userId", "date"])
    .index("by_status", ["status"]),

  // Supervisor Ratings
  supervisorRatings: defineTable({
    employeeId: v.id("users"),
    supervisorId: v.id("users"),
    // Rating categories (1-5 scale)
    qualityOfWork: v.number(), // 1-5
    efficiency: v.number(), // 1-5
    teamwork: v.number(), // 1-5
    initiative: v.number(), // 1-5
    communication: v.number(), // 1-5
    reliability: v.number(), // 1-5
    // Overall
    overallRating: v.number(), // calculated average
    // Text feedback
    strengths: v.optional(v.string()),
    areasForImprovement: v.optional(v.string()),
    generalComments: v.optional(v.string()),
    // Period
    ratingPeriod: v.string(), // e.g., "2026-02" for February 2026
    createdAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_supervisor", ["supervisorId"])
    .index("by_period", ["ratingPeriod"]),

  // Tasks (ToDo per employee, assigned by supervisor)
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    assignedTo: v.id("users"),       // employee
    assignedBy: v.id("users"),       // supervisor or admin
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    deadline: v.optional(v.number()),   // timestamp
    completedAt: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    attachmentUrl: v.optional(v.string()),
    attachments: v.optional(v.array(v.object({
      url: v.string(),
      name: v.string(),
      type: v.string(),
      size: v.number(),
      uploadedBy: v.id("users"),
      uploadedAt: v.number(),
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_assigned_to", ["assignedTo"])
    .index("by_assigned_by", ["assignedBy"])
    .index("by_status", ["status"])
    .index("by_deadline", ["deadline"]),

  // Task comments
  taskComments: defineTable({
    taskId: v.id("tasks"),
    authorId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_task", ["taskId"]),

  // Stripe Subscriptions
  subscriptions: defineTable({
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripeSessionId: v.optional(v.string()),
    plan: v.union(v.literal("starter"), v.literal("professional"), v.literal("enterprise")),
    status: v.union(
      v.literal("trialing"),
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("incomplete"),
    ),
    email: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    trialEnd: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"])
    .index("by_status", ["status"])
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),

  // Contact / Sales inquiries
  contactInquiries: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    message: v.string(),
    plan: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  // Work Schedule Configuration
  workSchedule: defineTable({
    userId: v.id("users"),
    // Default work hours
    startTime: v.string(), // "09:00"
    endTime: v.string(), // "18:00"
    // Working days (0 = Sunday, 1 = Monday, etc.)
    workingDays: v.array(v.number()), // e.g., [1,2,3,4,5] for Mon-Fri
    // Timezone
    timezone: v.string(), // e.g., "Asia/Yerevan"
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
