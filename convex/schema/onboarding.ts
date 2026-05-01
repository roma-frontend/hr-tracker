import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const onboarding = {
  // Reusable onboarding templates
  onboardingTemplates: defineTable({
    organizationId: v.id('organizations'),
    name: v.string(),
    description: v.optional(v.string()),
    department: v.optional(v.string()),
    role: v.optional(v.string()),
    isActive: v.boolean(),
    tasks: v.array(
      v.object({
        key: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        assigneeType: v.union(
          v.literal('new_hire'),
          v.literal('buddy'),
          v.literal('manager'),
          v.literal('hr'),
          v.literal('it'),
        ),
        category: v.union(
          v.literal('documentation'),
          v.literal('access'),
          v.literal('training'),
          v.literal('equipment'),
          v.literal('intro'),
          v.literal('other'),
        ),
        dayOffset: v.number(),
      })
    ),
    createdBy: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_org', ['organizationId'])
    .index('by_org_active', ['organizationId', 'isActive']),

  // Active onboarding program for a new hire
  onboardingPrograms: defineTable({
    organizationId: v.id('organizations'),
    employeeId: v.id('users'),
    templateId: v.optional(v.id('onboardingTemplates')),
    startDate: v.number(),
    buddyId: v.optional(v.id('users')),
    managerId: v.id('users'),
    status: v.union(
      v.literal('active'),
      v.literal('completed'),
      v.literal('cancelled'),
    ),
    createdBy: v.id('users'),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index('by_org', ['organizationId'])
    .index('by_org_status', ['organizationId', 'status'])
    .index('by_employee', ['employeeId'])
    .index('by_buddy', ['buddyId'])
    .index('by_manager', ['managerId']),

  // Individual tasks within an onboarding program
  onboardingTasks: defineTable({
    organizationId: v.id('organizations'),
    programId: v.id('onboardingPrograms'),
    templateTaskKey: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    assigneeType: v.union(
      v.literal('new_hire'),
      v.literal('buddy'),
      v.literal('manager'),
      v.literal('hr'),
      v.literal('it'),
    ),
    assigneeId: v.optional(v.id('users')),
    category: v.union(
      v.literal('documentation'),
      v.literal('access'),
      v.literal('training'),
      v.literal('equipment'),
      v.literal('intro'),
      v.literal('other'),
    ),
    dayOffset: v.number(),
    dueDate: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('skipped'),
    ),
    completedBy: v.optional(v.id('users')),
    completedAt: v.optional(v.number()),
    order: v.number(),
  })
    .index('by_program', ['programId'])
    .index('by_program_status', ['programId', 'status'])
    .index('by_assignee', ['assigneeId'])
    .index('by_org_due', ['organizationId', 'dueDate']),
};
