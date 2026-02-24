import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper: get today's date string in Armenia timezone (UTC+4)
function getTodayDate() {
  const now = new Date();
  const armeniaOffset = 4 * 60 * 60 * 1000;
  const armeniaTime = new Date(now.getTime() + armeniaOffset);
  return armeniaTime.toISOString().split("T")[0];
}

// ── Check In (Employee arrives at work) ──────────────────────────────────
export const checkIn = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const today = getTodayDate();

    // Check if already checked in today
    const existing = await ctx.db
      .query("timeTracking")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", today))
      .first();

    if (existing && existing.status === "checked_in") {
      throw new Error("Already checked in today");
    }

    // Get work schedule (default 9:00-18:00)
    const schedule = await ctx.db
      .query("workSchedule")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const startTime = schedule?.startTime || "09:00";
    const endTime = schedule?.endTime || "18:00";

    // Create scheduled times for today
    const todayDate = new Date(now);
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const scheduledStart = new Date(todayDate);
    scheduledStart.setHours(startHour, startMin, 0, 0);

    const scheduledEnd = new Date(todayDate);
    scheduledEnd.setHours(endHour, endMin, 0, 0);

    // Calculate if late
    const isLate = now > scheduledStart.getTime();
    const lateMinutes = isLate ? Math.floor((now - scheduledStart.getTime()) / 1000 / 60) : 0;

    // Create or update time tracking record
    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        checkInTime: now,
        status: "checked_in",
        isLate,
        lateMinutes: lateMinutes > 0 ? lateMinutes : undefined,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new record
      const id = await ctx.db.insert("timeTracking", {
        userId: args.userId,
        checkInTime: now,
        scheduledStartTime: scheduledStart.getTime(),
        scheduledEndTime: scheduledEnd.getTime(),
        isLate,
        lateMinutes: lateMinutes > 0 ? lateMinutes : undefined,
        isEarlyLeave: false,
        status: "checked_in",
        date: today,
        createdAt: now,
        updatedAt: now,
      });
      return id;
    }
  },
});

// ── Check Out (Employee leaves work) ─────────────────────────────────────
export const checkOut = mutation({
  args: {
    userId: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const today = getTodayDate();

    // Find today's check-in record
    const record = await ctx.db
      .query("timeTracking")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", today))
      .first();

    if (!record) {
      throw new Error("No check-in record found for today");
    }

    if (record.status === "checked_out") {
      throw new Error("Already checked out today");
    }

    // Calculate worked time
    const totalWorkedMinutes = Math.floor((now - record.checkInTime) / 1000 / 60);

    // Calculate if early leave
    const isEarlyLeave = now < record.scheduledEndTime;
    const earlyLeaveMinutes = isEarlyLeave
      ? Math.floor((record.scheduledEndTime - now) / 1000 / 60)
      : 0;

    // Calculate overtime
    const overtimeMinutes = now > record.scheduledEndTime
      ? Math.floor((now - record.scheduledEndTime) / 1000 / 60)
      : 0;

    // Update record
    await ctx.db.patch(record._id, {
      checkOutTime: now,
      status: "checked_out",
      totalWorkedMinutes,
      isEarlyLeave,
      earlyLeaveMinutes: earlyLeaveMinutes > 0 ? earlyLeaveMinutes : undefined,
      overtimeMinutes: overtimeMinutes > 0 ? overtimeMinutes : undefined,
      notes: args.notes,
      updatedAt: now,
    });

    return record._id;
  },
});

// ── Get Today's Status ───────────────────────────────────────────────────
export const getTodayStatus = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const today = getTodayDate();

    const record = await ctx.db
      .query("timeTracking")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", today))
      .first();

    return record || null;
  },
});

// ── Get User's Time Tracking History ─────────────────────────────────────
export const getUserHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("timeTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 30);

    return records;
  },
});

// ── Get All Employees Currently At Work ──────────────────────────────────
export const getCurrentlyAtWork = query({
  args: {},
  handler: async (ctx) => {
    const today = getTodayDate();

    const records = await ctx.db
      .query("timeTracking")
      .withIndex("by_date", (q) => q.eq("date", today))
      .collect();

    const atWork = records.filter((r) => r.status === "checked_in");

    const withUsers = await Promise.all(
      atWork.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        return { ...record, user };
      })
    );

    return withUsers;
  },
});

// ── Get Recent Attendance for a user (last N days) ───────────────────────
export const getRecentAttendance = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 7;
    const records = await ctx.db
      .query("timeTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
    return records;
  },
});

// ── Get Today's Full Attendance (all who checked in/out) ─────────────────
export const getTodayAllAttendance = query({
  args: {},
  handler: async (ctx) => {
    const today = getTodayDate();

    const records = await ctx.db
      .query("timeTracking")
      .withIndex("by_date", (q) => q.eq("date", today))
      .collect();

    const withUsers = await Promise.all(
      records.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        return { ...record, user };
      })
    );

    // Sort: checked_in first, then checked_out, then absent
    return withUsers.sort((a, b) => {
      const order = { checked_in: 0, checked_out: 1, absent: 2 };
      return order[a.status] - order[b.status];
    });
  },
});

// ── Get Today's Attendance Summary ───────────────────────────────────────
export const getTodayAttendanceSummary = query({
  args: {},
  handler: async (ctx) => {
    const today = getTodayDate();

    const records = await ctx.db
      .query("timeTracking")
      .withIndex("by_date", (q) => q.eq("date", today))
      .collect();

    const totalEmployees = await ctx.db.query("users").collect();
    const activeEmployees = totalEmployees.filter((u) => u.isActive);

    const checkedIn = records.filter((r) => r.status === "checked_in").length;
    const checkedOut = records.filter((r) => r.status === "checked_out").length;
    const late = records.filter((r) => r.isLate).length;
    const earlyLeave = records.filter((r) => r.isEarlyLeave).length;
    const absent = activeEmployees.length - records.length;

    return {
      totalActive: activeEmployees.length,
      checkedIn,
      checkedOut,
      late,
      earlyLeave,
      absent,
      attendanceRate: ((records.length / activeEmployees.length) * 100).toFixed(1),
    };
  },
});

// ── Get Monthly Attendance Stats for User ────────────────────────────────
export const getMonthlyStats = query({
  args: {
    userId: v.id("users"),
    month: v.string(), // "2026-02"
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("timeTracking")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Filter by month
    const monthRecords = records.filter((r) => r.date.startsWith(args.month));

    const totalDays = monthRecords.length;
    const lateDays = monthRecords.filter((r) => r.isLate).length;
    const earlyLeaveDays = monthRecords.filter((r) => r.isEarlyLeave).length;
    const totalWorkedMinutes = monthRecords.reduce(
      (sum, r) => sum + (r.totalWorkedMinutes || 0),
      0
    );
    const totalOvertimeMinutes = monthRecords.reduce(
      (sum, r) => sum + (r.overtimeMinutes || 0),
      0
    );

    return {
      totalDays,
      lateDays,
      earlyLeaveDays,
      totalWorkedHours: (totalWorkedMinutes / 60).toFixed(1),
      totalOvertimeHours: (totalOvertimeMinutes / 60).toFixed(1),
      averageWorkHours: totalDays > 0 ? (totalWorkedMinutes / 60 / totalDays).toFixed(1) : "0",
      punctualityRate: totalDays > 0 ? (((totalDays - lateDays) / totalDays) * 100).toFixed(1) : "100",
    };
  },
});

// ── Admin: Mark Employee as Absent ───────────────────────────────────────
export const markAbsent = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if record already exists
    const existing = await ctx.db
      .query("timeTracking")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
      .first();

    if (existing) {
      throw new Error("Record already exists for this date");
    }

    // Get schedule
    const schedule = await ctx.db
      .query("workSchedule")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const startTime = schedule?.startTime || "09:00";
    const endTime = schedule?.endTime || "18:00";

    const dateObj = new Date(args.date);
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const scheduledStart = new Date(dateObj);
    scheduledStart.setHours(startHour, startMin, 0, 0);

    const scheduledEnd = new Date(dateObj);
    scheduledEnd.setHours(endHour, endMin, 0, 0);

    // Create absent record
    const id = await ctx.db.insert("timeTracking", {
      userId: args.userId,
      checkInTime: 0, // no check-in
      scheduledStartTime: scheduledStart.getTime(),
      scheduledEndTime: scheduledEnd.getTime(),
      isLate: false,
      isEarlyLeave: false,
      status: "absent",
      date: args.date,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return id;
  },
});
