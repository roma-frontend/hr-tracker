/**
 * Recurring Trips Module
 *
 * Queries and mutations for recurring trip management
 */

import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';

/** Create a recurring trip template */
export const createRecurringTrip = mutation({
  args: {
    organizationId: v.id('organizations'),
    userId: v.id('users'),
    driverId: v.id('drivers'),
    tripInfo: v.object({
      from: v.string(),
      to: v.string(),
      purpose: v.string(),
      passengerCount: v.number(),
      notes: v.optional(v.string()),
      pickupCoords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
      dropoffCoords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    }),
    schedule: v.object({
      daysOfWeek: v.array(v.number()),
      startTime: v.string(),
      endTime: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('recurringTrips', {
      organizationId: args.organizationId,
      userId: args.userId,
      driverId: args.driverId,
      tripInfo: args.tripInfo,
      schedule: args.schedule,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return id;
  },
});

/** Toggle recurring trip active status */
export const toggleRecurringTrip = mutation({
  args: {
    recurringTripId: v.id('recurringTrips'),
    userId: v.id('users'),
  },
  handler: async (ctx, { recurringTripId, userId }) => {
    const trip = await ctx.db.get(recurringTripId);
    if (!trip) throw new Error('Recurring trip not found');
    if (trip.userId !== userId) throw new Error('Unauthorized');

    await ctx.db.patch(recurringTripId, {
      isActive: !trip.isActive,
      updatedAt: Date.now(),
    });

    return { success: true, isActive: !trip.isActive };
  },
});

/** Delete a recurring trip */
export const deleteRecurringTrip = mutation({
  args: {
    recurringTripId: v.id('recurringTrips'),
    userId: v.id('users'),
  },
  handler: async (ctx, { recurringTripId, userId }) => {
    const trip = await ctx.db.get(recurringTripId);
    if (!trip) throw new Error('Recurring trip not found');
    if (trip.userId !== userId) throw new Error('Unauthorized');

    await ctx.db.delete(recurringTripId);
    return { success: true };
  },
});

/** Generate individual requests from recurring trips for the current week */
export const generateRecurringRequests = mutation({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, { organizationId }) => {
    const recurringTrips = await ctx.db
      .query('recurringTrips')
      .withIndex('by_org', (q) => q.eq('organizationId', organizationId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    const now = new Date();
    const dayOfWeek = now.getDay();
    const generated: string[] = [];

    for (const trip of recurringTrips) {
      // Check if today is one of the scheduled days
      if (!trip.schedule.daysOfWeek.includes(dayOfWeek)) {
        continue;
      }

      // Check if request already exists for today
      const [startHour, startMin] = trip.schedule.startTime.split(':').map(Number);
      const tripDate = new Date(now);
      tripDate.setHours(startHour ?? 0, startMin ?? 0, 0, 0);

      const existing = await ctx.db
        .query('driverRequests')
        .withIndex('by_requester', (q) => q.eq('requesterId', trip.userId))
        .filter((q) =>
          q.and(
            q.eq(q.field('driverId'), trip.driverId),
            q.eq(q.field('startTime'), tripDate.getTime()),
          ),
        )
        .first();

      if (existing) {
        continue; // Already created
      }

      // Create request
      const requestId = await ctx.db.insert('driverRequests', {
        organizationId,
        requesterId: trip.userId,
        driverId: trip.driverId,
        startTime: tripDate.getTime(),
        endTime: tripDate.getTime() + 3600000, // Default 1 hour
        tripInfo: trip.tripInfo,
        status: 'pending',
        priority: 'P2',
        tripCategory: 'office_transfer',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isRecurring: true,
        recurringTripId: trip._id,
      });

      generated.push(requestId);
    }

    return { generatedCount: generated.length, requestIds: generated };
  },
});

/** Add favorite driver */
export const addFavoriteDriver = mutation({
  args: {
    userId: v.id('users'),
    driverId: v.id('drivers'),
  },
  handler: async (ctx, { userId, driverId }) => {
    // Check if already favorited
    const existing = await ctx.db
      .query('favoriteDrivers')
      .withIndex('by_user_driver', (q) => q.eq('userId', userId).eq('driverId', driverId))
      .first();

    if (existing) {
      return { success: false, message: 'Already in favorites' };
    }

    await ctx.db.insert('favoriteDrivers', {
      userId,
      driverId,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/** Remove favorite driver */
export const removeFavoriteDriver = mutation({
  args: {
    userId: v.id('users'),
    driverId: v.id('drivers'),
  },
  handler: async (ctx, { userId, driverId }) => {
    const favorite = await ctx.db
      .query('favoriteDrivers')
      .withIndex('by_user_driver', (q) => q.eq('userId', userId).eq('driverId', driverId))
      .first();

    if (!favorite) {
      return { success: false, message: 'Not in favorites' };
    }

    await ctx.db.delete(favorite._id);
    return { success: true };
  },
});
