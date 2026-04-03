import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const productivity = {
  workSchedule: defineTable({
    organizationId: v.optional(v.id('organizations')),
    userId: v.id('users'),
    startTime: v.string(),
    endTime: v.string(),
    workingDays: v.array(v.number()),
    timezone: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_user', ['userId']),

  userPreferences: defineTable({
    userId: v.id('users'),
    key: v.string(),
    value: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_key', ['userId', 'key']),

  pomodoroSessions: defineTable({
    userId: v.id('users'),
    taskId: v.optional(v.id('tasks')),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    completed: v.boolean(),
    interrupted: v.boolean(),
    actualEndTime: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_user_active', ['userId', 'completed', 'interrupted']),
};
