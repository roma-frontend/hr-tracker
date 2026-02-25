import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Create Task ────────────────────────────────────────────────────────────
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    assignedTo: v.id("users"),
    assignedBy: v.id("users"),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    deadline: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      assignedTo: args.assignedTo,
      assignedBy: args.assignedBy,
      status: "pending",
      priority: args.priority,
      deadline: args.deadline,
      tags: args.tags,
      createdAt: now,
      updatedAt: now,
    });

    // Notify the employee
    await ctx.db.insert("notifications", {
      userId: args.assignedTo,
      type: "system",
      title: "New Task Assigned",
      message: `You have a new task: "${args.title}"`,
      isRead: false,
      relatedId: taskId,
      createdAt: now,
    });

    return taskId;
  },
});

// ── Update Task Status (employee can update) ───────────────────────────────
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const now = Date.now();
    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: now,
      completedAt: args.status === "completed" ? now : task.completedAt,
    });

    // Notify supervisor when task goes to review or completed
    if (args.status === "review" || args.status === "completed") {
      const employee = await ctx.db.get(args.userId);
      await ctx.db.insert("notifications", {
        userId: task.assignedBy,
        type: "system",
        title: args.status === "completed" ? "Task Completed" : "Task Ready for Review",
        message: `"${task.title}" has been ${args.status === "completed" ? "completed" : "submitted for review"} by ${employee?.name ?? "employee"}`,
        isRead: false,
        relatedId: args.taskId,
        createdAt: now,
      });
    }
  },
});

// ── Update Task (supervisor/admin) ─────────────────────────────────────────
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    deadline: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    const { taskId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(taskId, { ...filtered, updatedAt: Date.now() });
  },
});

// ── Delete Task ────────────────────────────────────────────────────────────
export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    // Delete comments first
    const comments = await ctx.db
      .query("taskComments")
      .withIndex("by_task", q => q.eq("taskId", args.taskId))
      .collect();
    for (const c of comments) await ctx.db.delete(c._id);
    await ctx.db.delete(args.taskId);
  },
});

// ── Add Comment ────────────────────────────────────────────────────────────
export const addComment = mutation({
  args: {
    taskId: v.id("tasks"),
    authorId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("taskComments", {
      taskId: args.taskId,
      authorId: args.authorId,
      content: args.content,
      createdAt: now,
    });
    await ctx.db.patch(args.taskId, { updatedAt: now });
  },
});

// ── Assign Supervisor to Employee ──────────────────────────────────────────
export const assignSupervisor = mutation({
  args: {
    employeeId: v.id("users"),
    supervisorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.employeeId, {
      supervisorId: args.supervisorId,
    });
  },
});

// ── Get Tasks for Employee ─────────────────────────────────────────────────
export const getTasksForEmployee = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assigned_to", q => q.eq("assignedTo", args.userId))
      .order("desc")
      .collect();

    return await Promise.all(
      tasks.map(async task => {
        const assignedBy = await ctx.db.get(task.assignedBy);
        const comments = await ctx.db
          .query("taskComments")
          .withIndex("by_task", q => q.eq("taskId", task._id))
          .collect();
        const commentsWithAuthors = await Promise.all(
          comments.map(async c => ({
            ...c,
            author: await ctx.db.get(c.authorId),
          }))
        );
        return { ...task, assignedByUser: assignedBy, comments: commentsWithAuthors };
      })
    );
  },
});

// ── Get Tasks assigned by supervisor ──────────────────────────────────────
export const getTasksAssignedBy = query({
  args: { supervisorId: v.id("users") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assigned_by", q => q.eq("assignedBy", args.supervisorId))
      .order("desc")
      .collect();

    return await Promise.all(
      tasks.map(async task => {
        const assignedTo = await ctx.db.get(task.assignedTo);
        const comments = await ctx.db
          .query("taskComments")
          .withIndex("by_task", q => q.eq("taskId", task._id))
          .collect();
        return {
          ...task,
          assignedToUser: {
            ...assignedTo,
            avatarUrl: assignedTo?.avatarUrl ?? assignedTo?.faceImageUrl,
          },
          commentCount: comments.length,
        };
      })
    );
  },
});

// ── Get All Tasks (admin) ──────────────────────────────────────────────────
export const getAllTasks = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").order("desc").collect();

    return await Promise.all(
      tasks.map(async task => {
        const assignedTo = await ctx.db.get(task.assignedTo);
        const assignedBy = await ctx.db.get(task.assignedBy);
        const comments = await ctx.db
          .query("taskComments")
          .withIndex("by_task", q => q.eq("taskId", task._id))
          .collect();
        return {
          ...task,
          assignedToUser: {
            ...assignedTo,
            avatarUrl: assignedTo?.avatarUrl ?? assignedTo?.faceImageUrl,
          },
          assignedByUser: {
            ...assignedBy,
            avatarUrl: assignedBy?.avatarUrl ?? assignedBy?.faceImageUrl,
          },
          commentCount: comments.length,
        };
      })
    );
  },
});

// ── Get My Team Tasks (supervisor sees tasks of their subordinates) ─────────
export const getTeamTasks = query({
  args: { supervisorId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all employees under this supervisor
    const employees = await ctx.db
      .query("users")
      .withIndex("by_supervisor", q => q.eq("supervisorId", args.supervisorId))
      .collect();

    const employeeIds = employees.map(e => e._id);

    // Get tasks for all these employees
    const allTasks = await Promise.all(
      employeeIds.map(async empId => {
        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_assigned_to", q => q.eq("assignedTo", empId))
          .collect();
        return tasks;
      })
    );

    const flatTasks = allTasks.flat();

    return await Promise.all(
      flatTasks.map(async task => {
        const assignedTo = await ctx.db.get(task.assignedTo);
        const comments = await ctx.db
          .query("taskComments")
          .withIndex("by_task", q => q.eq("taskId", task._id))
          .collect();
        return {
          ...task,
          assignedToUser: {
            ...assignedTo,
            avatarUrl: assignedTo?.avatarUrl ?? assignedTo?.faceImageUrl,
          },
          commentCount: comments.length,
        };
      })
    );
  },
});

// ── Get Employees under supervisor ────────────────────────────────────────
export const getMyEmployees = query({
  args: { supervisorId: v.id("users") },
  handler: async (ctx, args) => {
    const employees = await ctx.db
      .query("users")
      .withIndex("by_supervisor", q => q.eq("supervisorId", args.supervisorId))
      .collect();
    return employees.map(e => ({
      ...e,
      avatarUrl: e.avatarUrl ?? e.faceImageUrl,
    }));
  },
});

// ── Get all users for assignment (admin/supervisor) ────────────────────────
export const getUsersForAssignment = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter(u => u.isActive && u.role === "employee")
      .map(u => ({
        _id: u._id,
        name: u.name,
        position: u.position,
        department: u.department,
        avatarUrl: u.avatarUrl ?? u.faceImageUrl,
        supervisorId: u.supervisorId,
      }));
  },
});

// ── Get supervisors list ───────────────────────────────────────────────────
export const getSupervisors = query({
  args: {},
  handler: async (ctx) => {
    const supervisors = await ctx.db
      .query("users")
      .withIndex("by_role", q => q.eq("role", "supervisor"))
      .collect();
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", q => q.eq("role", "admin"))
      .collect();
    return [...supervisors, ...admins]
      .filter(u => u.isActive)
      .map(u => ({
        _id: u._id,
        name: u.name,
        role: u.role,
        position: u.position,
        department: u.department,
        avatarUrl: u.avatarUrl ?? u.faceImageUrl,
      }));
  },
});

// ── Get task comments ──────────────────────────────────────────────────────
// ── Add Attachment ─────────────────────────────────────────────────────────
export const addAttachment = mutation({
  args: {
    taskId: v.id("tasks"),
    url: v.string(),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    const attachments = task.attachments ?? [];
    await ctx.db.patch(args.taskId, {
      attachments: [...attachments, {
        url: args.url,
        name: args.name,
        type: args.type,
        size: args.size,
        uploadedBy: args.uploadedBy,
        uploadedAt: Date.now(),
      }],
      updatedAt: Date.now(),
    });
  },
});

// ── Remove Attachment ──────────────────────────────────────────────────────
export const removeAttachment = mutation({
  args: {
    taskId: v.id("tasks"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    const attachments = (task.attachments ?? []).filter((a: any) => a.url !== args.url);
    await ctx.db.patch(args.taskId, { attachments, updatedAt: Date.now() });
  },
});

// ── Get Task Comments ──────────────────────────────────────────────────────
export const getTaskComments = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("taskComments")
      .withIndex("by_task", q => q.eq("taskId", args.taskId))
      .order("asc")
      .collect();
    return await Promise.all(
      comments.map(async c => ({
        ...c,
        author: await ctx.db.get(c.authorId),
      }))
    );
  },
});
