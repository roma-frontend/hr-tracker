import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// ─── Helpers ─────────────────────────────────────────────────
function computeProgress(tasks: { status: string }[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'completed' || t.status === 'skipped').length;
  return Math.round((done / tasks.length) * 100);
}

// ─── Queries ─────────────────────────────────────────────────

export const listTemplates = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, { organizationId }) => {
    return await ctx.db
      .query('onboardingTemplates')
      .withIndex('by_org', (q) => q.eq('organizationId', organizationId))
      .collect();
  },
});

export const listPrograms = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, { organizationId }) => {
    const programs = await ctx.db
      .query('onboardingPrograms')
      .withIndex('by_org', (q) => q.eq('organizationId', organizationId))
      .order('desc')
      .collect();

    const result = await Promise.all(
      programs.map(async (prog) => {
        const tasks = await ctx.db
          .query('onboardingTasks')
          .withIndex('by_program', (q) => q.eq('programId', prog._id))
          .collect();
        const employee = await ctx.db.get(prog.employeeId);
        const buddy = prog.buddyId ? await ctx.db.get(prog.buddyId) : null;
        return {
          ...prog,
          progress: computeProgress(tasks),
          totalTasks: tasks.length,
          completedTasks: tasks.filter((t) => t.status === 'completed' || t.status === 'skipped').length,
          employeeName: employee?.name ?? 'Unknown',
          buddyName: buddy?.name,
        };
      })
    );
    return result;
  },
});

export const getProgram = query({
  args: { programId: v.id('onboardingPrograms') },
  handler: async (ctx, { programId }) => {
    const program = await ctx.db.get(programId);
    if (!program) return null;

    const tasks = await ctx.db
      .query('onboardingTasks')
      .withIndex('by_program', (q) => q.eq('programId', programId))
      .collect();

    const employee = await ctx.db.get(program.employeeId);
    const buddy = program.buddyId ? await ctx.db.get(program.buddyId) : null;
    const manager = await ctx.db.get(program.managerId);

    // Resolve assignee names
    const tasksWithNames = await Promise.all(
      tasks.sort((a, b) => a.order - b.order).map(async (task) => {
        let assigneeName: string | undefined;
        if (task.assigneeId) {
          const assignee = await ctx.db.get(task.assigneeId);
          assigneeName = assignee?.name;
        }
        return { ...task, assigneeName };
      })
    );

    return {
      ...program,
      progress: computeProgress(tasks),
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'completed' || t.status === 'skipped').length,
      employeeName: employee?.name ?? 'Unknown',
      employeeEmail: employee?.email,
      buddyName: buddy?.name,
      managerName: manager?.name ?? 'Unknown',
      tasks: tasksWithNames,
    };
  },
});

export const getMyOnboarding = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const program = await ctx.db
      .query('onboardingPrograms')
      .withIndex('by_employee', (q) => q.eq('employeeId', userId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .first();

    if (!program) return null;

    const tasks = await ctx.db
      .query('onboardingTasks')
      .withIndex('by_program', (q) => q.eq('programId', program._id))
      .collect();

    const buddy = program.buddyId ? await ctx.db.get(program.buddyId) : null;
    const manager = await ctx.db.get(program.managerId);

    return {
      ...program,
      progress: computeProgress(tasks),
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'completed' || t.status === 'skipped').length,
      buddyName: buddy?.name,
      managerName: manager?.name ?? 'Unknown',
      tasks: tasks.sort((a, b) => a.order - b.order),
    };
  },
});

export const getMyMenteePrograms = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const asBuddy = await ctx.db
      .query('onboardingPrograms')
      .withIndex('by_buddy', (q) => q.eq('buddyId', userId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();

    const asManager = await ctx.db
      .query('onboardingPrograms')
      .withIndex('by_manager', (q) => q.eq('managerId', userId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();

    const all = [...asBuddy, ...asManager];
    const unique = Array.from(new Map(all.map((p) => [p._id, p])).values());

    return await Promise.all(
      unique.map(async (prog) => {
        const tasks = await ctx.db
          .query('onboardingTasks')
          .withIndex('by_program', (q) => q.eq('programId', prog._id))
          .collect();
        const employee = await ctx.db.get(prog.employeeId);
        return {
          ...prog,
          progress: computeProgress(tasks),
          totalTasks: tasks.length,
          completedTasks: tasks.filter((t) => t.status === 'completed' || t.status === 'skipped').length,
          employeeName: employee?.name ?? 'Unknown',
        };
      })
    );
  },
});

// ─── Mutations ───────────────────────────────────────────────

export const createTemplate = mutation({
  args: {
    organizationId: v.id('organizations'),
    name: v.string(),
    description: v.optional(v.string()),
    department: v.optional(v.string()),
    role: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('onboardingTemplates', {
      organizationId: args.organizationId,
      name: args.name,
      description: args.description,
      department: args.department,
      role: args.role,
      isActive: true,
      tasks: args.tasks,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateTemplate = mutation({
  args: {
    templateId: v.id('onboardingTemplates'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    department: v.optional(v.string()),
    role: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    tasks: v.optional(
      v.array(
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
      )
    ),
  },
  handler: async (ctx, { templateId, ...fields }) => {
    const update: Record<string, unknown> = { updatedAt: Date.now() };
    if (fields.name !== undefined) update.name = fields.name;
    if (fields.description !== undefined) update.description = fields.description;
    if (fields.department !== undefined) update.department = fields.department;
    if (fields.role !== undefined) update.role = fields.role;
    if (fields.isActive !== undefined) update.isActive = fields.isActive;
    if (fields.tasks !== undefined) update.tasks = fields.tasks;
    await ctx.db.patch(templateId, update);
  },
});

export const deleteTemplate = mutation({
  args: { templateId: v.id('onboardingTemplates') },
  handler: async (ctx, { templateId }) => {
    await ctx.db.delete(templateId);
  },
});

export const startOnboarding = mutation({
  args: {
    organizationId: v.id('organizations'),
    employeeId: v.id('users'),
    templateId: v.optional(v.id('onboardingTemplates')),
    startDate: v.number(),
    buddyId: v.optional(v.id('users')),
    managerId: v.id('users'),
    createdBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Guard against duplicate active programs
    const existing = await ctx.db
      .query('onboardingPrograms')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .first();
    if (existing) {
      throw new Error('This employee already has an active onboarding program');
    }

    const programId = await ctx.db.insert('onboardingPrograms', {
      organizationId: args.organizationId,
      employeeId: args.employeeId,
      templateId: args.templateId,
      startDate: args.startDate,
      buddyId: args.buddyId,
      managerId: args.managerId,
      status: 'active',
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });

    // Spawn tasks from template
    if (args.templateId) {
      const template = await ctx.db.get(args.templateId);
      if (template) {
        for (let i = 0; i < template.tasks.length; i++) {
          const t = template.tasks[i]!;
          // Resolve assigneeId based on type
          let assigneeId: typeof args.employeeId | undefined;
          if (t.assigneeType === 'new_hire') assigneeId = args.employeeId;
          else if (t.assigneeType === 'buddy' && args.buddyId) assigneeId = args.buddyId;
          else if (t.assigneeType === 'manager') assigneeId = args.managerId;

          const dueDate = args.startDate + t.dayOffset * 86400000;
          await ctx.db.insert('onboardingTasks', {
            organizationId: args.organizationId,
            programId,
            templateTaskKey: t.key,
            title: t.title,
            description: t.description,
            assigneeType: t.assigneeType,
            assigneeId,
            category: t.category,
            dayOffset: t.dayOffset,
            dueDate,
            status: 'pending',
            order: i,
          });
        }
      }
    }

    return programId;
  },
});

export const addTask = mutation({
  args: {
    programId: v.id('onboardingPrograms'),
    organizationId: v.id('organizations'),
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
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query('onboardingTasks')
      .withIndex('by_program', (q) => q.eq('programId', args.programId))
      .collect();

    await ctx.db.insert('onboardingTasks', {
      organizationId: args.organizationId,
      programId: args.programId,
      title: args.title,
      description: args.description,
      assigneeType: args.assigneeType,
      assigneeId: args.assigneeId,
      category: args.category,
      dayOffset: args.dayOffset,
      dueDate: args.dueDate,
      status: 'pending',
      order: tasks.length,
    });
  },
});

export const completeTask = mutation({
  args: { taskId: v.id('onboardingTasks'), completedBy: v.id('users') },
  handler: async (ctx, { taskId, completedBy }) => {
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error('Task not found');
    if (task.status === 'completed') return;

    await ctx.db.patch(taskId, {
      status: 'completed',
      completedBy,
      completedAt: Date.now(),
    });
  },
});

export const skipTask = mutation({
  args: { taskId: v.id('onboardingTasks'), completedBy: v.id('users') },
  handler: async (ctx, { taskId, completedBy }) => {
    await ctx.db.patch(taskId, {
      status: 'skipped',
      completedBy,
      completedAt: Date.now(),
    });
  },
});

export const assignBuddy = mutation({
  args: { programId: v.id('onboardingPrograms'), buddyId: v.id('users') },
  handler: async (ctx, { programId, buddyId }) => {
    await ctx.db.patch(programId, { buddyId });
    // Update buddy-assigned tasks
    const tasks = await ctx.db
      .query('onboardingTasks')
      .withIndex('by_program', (q) => q.eq('programId', programId))
      .filter((q) => q.eq(q.field('assigneeType'), 'buddy'))
      .collect();
    for (const task of tasks) {
      await ctx.db.patch(task._id, { assigneeId: buddyId });
    }
  },
});

export const completeProgram = mutation({
  args: { programId: v.id('onboardingPrograms') },
  handler: async (ctx, { programId }) => {
    await ctx.db.patch(programId, {
      status: 'completed',
      completedAt: Date.now(),
    });
  },
});

export const cancelProgram = mutation({
  args: { programId: v.id('onboardingPrograms') },
  handler: async (ctx, { programId }) => {
    await ctx.db.patch(programId, { status: 'cancelled' });
  },
});
