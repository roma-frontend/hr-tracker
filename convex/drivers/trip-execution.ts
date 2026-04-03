/**
 * Trip Execution Mutations
 *
 * Mutations for trip status, feedback, ratings, ETA, and notes
 */

import { v } from 'convex/values';
import { mutation } from '../_generated/server';

/** Update trip status (in_progress, completed, etc.) */
export const updateTripStatus = mutation({
  args: {
    scheduleId: v.id('driverSchedules'),
    userId: v.id('users'),
    status: v.union(v.literal('in_progress'), v.literal('completed'), v.literal('cancelled')),
  },
  handler: async (ctx, { scheduleId, userId, status }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error('Schedule not found');

    // Verify user is the driver
    if (schedule.driverId) {
      const driver = await ctx.db.get(schedule.driverId);
      if (!driver || driver.userId !== userId) {
        throw new Error('Only the driver can update trip status');
      }
    }

    await ctx.db.patch(scheduleId, {
      status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/** Submit driver feedback after trip completion */
export const submitDriverFeedback = mutation({
  args: {
    scheduleId: v.id('driverSchedules'),
    userId: v.id('users'),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, { scheduleId, userId, rating, comment }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error('Schedule not found');

    // Verify user is the driver
    if (schedule.driverId) {
      const driver = await ctx.db.get(schedule.driverId);
      if (!driver || driver.userId !== userId) {
        throw new Error('Only the driver can submit feedback');
      }
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    await ctx.db.patch(scheduleId, {
      driverFeedback: {
        rating,
        comment,
        completedAt: Date.now(),
      },
      status: 'completed',
      updatedAt: Date.now(),
    });

    // Update driver's total rating
    if (schedule.driverId) {
      const driver = await ctx.db.get(schedule.driverId);
      if (driver) {
        const currentRating = driver.rating || 5.0;
        const totalTrips = driver.totalTrips || 0;
        const newRating = (currentRating * totalTrips + rating) / (totalTrips + 1);
        await ctx.db.patch(schedule.driverId, {
          rating: newRating,
          totalTrips: totalTrips + 1,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

/** Submit passenger rating for driver after completed trip */
export const submitPassengerRating = mutation({
  args: {
    scheduleId: v.id('driverSchedules'),
    requestId: v.optional(v.id('driverRequests')),
    passengerId: v.id('users'),
    driverId: v.id('drivers'),
    organizationId: v.id('organizations'),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if already rated
    const existing = await ctx.db
      .query('passengerRatings')
      .withIndex('by_schedule', (q) => q.eq('scheduleId', args.scheduleId))
      .filter((q) => q.eq(q.field('passengerId'), args.passengerId))
      .first();

    if (existing) {
      throw new Error('You have already rated this trip');
    }

    // Insert rating
    await ctx.db.insert('passengerRatings', {
      organizationId: args.organizationId,
      scheduleId: args.scheduleId,
      requestId: args.requestId,
      passengerId: args.passengerId,
      driverId: args.driverId,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    });

    // Update driver average rating
    const driver = await ctx.db.get(args.driverId);
    if (driver) {
      const allRatings = await ctx.db
        .query('passengerRatings')
        .withIndex('by_driver', (q) => q.eq('driverId', args.driverId))
        .collect();
      const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0) + args.rating;
      const count = allRatings.length + 1;
      await ctx.db.patch(args.driverId, {
        rating: totalRating / count,
        updatedAt: Date.now(),
      });
    }

    // Mark request as rated
    if (args.requestId) {
      await ctx.db.patch(args.requestId, {
        passengerRated: true,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/** Add driver notes to a schedule */
export const addDriverNotes = mutation({
  args: {
    scheduleId: v.id('driverSchedules'),
    userId: v.id('users'),
    notes: v.string(),
  },
  handler: async (ctx, { scheduleId, userId, notes }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error('Schedule not found');

    // Verify user is the driver or admin
    if (schedule.driverId) {
      const driver = await ctx.db.get(schedule.driverId);
      if (!driver || driver.userId !== userId) {
        throw new Error('Only the driver can add notes');
      }
    }

    await ctx.db.patch(scheduleId, {
      driverNotes: notes,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/** Mark driver as arrived */
export const markDriverArrived = mutation({
  args: {
    scheduleId: v.id('driverSchedules'),
    userId: v.id('users'),
  },
  handler: async (ctx, { scheduleId, userId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error('Schedule not found');

    // Verify user is the driver
    if (schedule.driverId) {
      const driver = await ctx.db.get(schedule.driverId);
      if (!driver || driver.userId !== userId) {
        throw new Error('Only the driver can mark arrival');
      }
    }

    await ctx.db.patch(scheduleId, {
      arrivedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Notify passenger
    if (schedule.userId) {
      await ctx.db.insert('notifications', {
        organizationId: schedule.organizationId,
        userId: schedule.userId,
        type: 'driver_arrived',
        title: 'Your driver has arrived!',
        message: 'Please proceed to the pickup location',
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/** Mark passenger as picked up */
export const markPassengerPickedUp = mutation({
  args: {
    scheduleId: v.id('driverSchedules'),
    userId: v.id('users'),
  },
  handler: async (ctx, { scheduleId, userId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error('Schedule not found');

    // Verify user is the driver
    if (schedule.driverId) {
      const driver = await ctx.db.get(schedule.driverId);
      if (!driver || driver.userId !== userId) {
        throw new Error('Only the driver can mark pickup');
      }
    }

    await ctx.db.patch(scheduleId, {
      passengerPickedUpAt: Date.now(),
      status: 'in_progress',
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/** Update ETA for a trip */
export const updateETA = mutation({
  args: {
    scheduleId: v.id('driverSchedules'),
    userId: v.id('users'),
    etaMinutes: v.number(),
  },
  handler: async (ctx, { scheduleId, userId, etaMinutes }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error('Schedule not found');

    // Verify user is the driver
    if (schedule.driverId) {
      const driver = await ctx.db.get(schedule.driverId);
      if (!driver || driver.userId !== userId) {
        throw new Error('Only the driver can update ETA');
      }
    }

    await ctx.db.patch(scheduleId, {
      etaMinutes,
      updatedAt: Date.now(),
    });

    // Notify passenger about ETA
    if (schedule.userId) {
      await ctx.db.insert('notifications', {
        organizationId: schedule.organizationId,
        userId: schedule.userId,
        type: 'eta_update',
        title: 'ETA Updated',
        message: `Your driver will arrive in approximately ${etaMinutes} minutes`,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});
