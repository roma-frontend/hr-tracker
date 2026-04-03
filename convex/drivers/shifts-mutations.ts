/**
 * Driver Shifts Module
 *
 * Queries and mutations for driver shift management
 */

import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';

/** Start a driver shift */
export const startShift = mutation({
  args: {
    driverId: v.id('drivers'),
    userId: v.id('users'),
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, { driverId, userId, organizationId }) => {
    // Check if driver already has an active shift
    const existingShift = await ctx.db
      .query('driverShifts')
      .withIndex('by_driver', (q) => q.eq('driverId', driverId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .first();

    if (existingShift) {
      throw new Error('Driver already has an active shift');
    }

    // Verify user is the driver
    const driver = await ctx.db.get(driverId);
    if (!driver || driver.userId !== userId) {
      throw new Error('Only the driver can start a shift');
    }

    const shiftId = await ctx.db.insert('driverShifts', {
      organizationId,
      driverId,
      userId,
      startTime: Date.now(),
      status: 'active',
      tripCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update driver availability
    await ctx.db.patch(driverId, {
      isAvailable: true,
      updatedAt: Date.now(),
    });

    return { shiftId, success: true };
  },
});

/** End a driver shift */
export const endShift = mutation({
  args: {
    shiftId: v.id('driverShifts'),
    userId: v.id('users'),
  },
  handler: async (ctx, { shiftId, userId }) => {
    const shift = await ctx.db.get(shiftId);
    if (!shift) throw new Error('Shift not found');
    if (shift.userId !== userId) throw new Error('Unauthorized');

    const endTime = Date.now();
    const durationMinutes = (endTime - shift.startTime) / 60000;

    await ctx.db.patch(shiftId, {
      status: 'completed',
      endTime,
      durationMinutes,
      updatedAt: Date.now(),
    });

    // Update driver availability
    await ctx.db.patch(shift.driverId, {
      isAvailable: false,
      updatedAt: Date.now(),
    });

    return { success: true, durationMinutes };
  },
});

/** Pause a driver shift */
export const pauseShift = mutation({
  args: {
    shiftId: v.id('driverShifts'),
    userId: v.id('users'),
  },
  handler: async (ctx, { shiftId, userId }) => {
    const shift = await ctx.db.get(shiftId);
    if (!shift) throw new Error('Shift not found');
    if (shift.userId !== userId) throw new Error('Unauthorized');
    if (shift.status !== 'active') throw new Error('Shift is not active');

    await ctx.db.patch(shiftId, {
      status: 'paused',
      pausedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/** Resume a paused driver shift */
export const resumeShift = mutation({
  args: {
    shiftId: v.id('driverShifts'),
    userId: v.id('users'),
  },
  handler: async (ctx, { shiftId, userId }) => {
    const shift = await ctx.db.get(shiftId);
    if (!shift) throw new Error('Shift not found');
    if (shift.userId !== userId) throw new Error('Unauthorized');
    if (shift.status !== 'paused') throw new Error('Shift is not paused');

    await ctx.db.patch(shiftId, {
      status: 'active',
      resumedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/** Update trip count for a shift */
export const updateShiftTripCount = mutation({
  args: {
    shiftId: v.id('driverShifts'),
    userId: v.id('users'),
  },
  handler: async (ctx, { shiftId, userId }) => {
    const shift = await ctx.db.get(shiftId);
    if (!shift) throw new Error('Shift not found');
    if (shift.userId !== userId) throw new Error('Unauthorized');

    await ctx.db.patch(shiftId, {
      tripCount: (shift.tripCount ?? 0) + 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
