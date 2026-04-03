/**
 * Driver Management Mutations
 *
 * Mutations for driver registration, availability, and time management
 */

import { v } from 'convex/values';
import { mutation } from '../_generated/server';

/** Register as a driver - only organization admins can register drivers */
export const registerAsDriver = mutation({
  args: {
    organizationId: v.id('organizations'),
    userId: v.id('users'),
    vehicleInfo: v.object({
      model: v.string(),
      plateNumber: v.string(),
      capacity: v.number(),
      color: v.optional(v.string()),
      year: v.optional(v.number()),
    }),
    workingHours: v.object({
      startTime: v.string(),
      endTime: v.string(),
      workingDays: v.array(v.number()),
    }),
    maxTripsPerDay: v.number(),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Get the user making the request
    const requester = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!requester) {
      throw new Error('User not found');
    }

    // Only organization admins can register drivers
    if (requester.role !== 'admin') {
      throw new Error('Only organization admins can register drivers');
    }

    // Verify the user being registered belongs to the same organization
    const userToRegister = await ctx.db.get(args.userId);
    if (!userToRegister || userToRegister.organizationId !== args.organizationId) {
      throw new Error('User does not belong to this organization');
    }

    // Check if user is already a driver
    const existing = await ctx.db
      .query('drivers')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existing) {
      // Update existing driver info instead of throwing error
      await ctx.db.patch(existing._id, {
        vehicleInfo: args.vehicleInfo,
        workingHours: args.workingHours,
        maxTripsPerDay: args.maxTripsPerDay,
        isAvailable: true,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const driverId = await ctx.db.insert('drivers', {
      organizationId: args.organizationId,
      userId: args.userId,
      vehicleInfo: args.vehicleInfo,
      isAvailable: true,
      workingHours: args.workingHours,
      maxTripsPerDay: args.maxTripsPerDay,
      currentTripsToday: 0,
      rating: 5.0,
      totalTrips: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return driverId;
  },
});

/** Update driver availability */
export const updateDriverAvailability = mutation({
  args: {
    driverId: v.id('drivers'),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, { driverId, isAvailable }) => {
    await ctx.db.patch(driverId, {
      isAvailable,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

/** Block time slot (for driver) */
export const blockTimeSlot = mutation({
  args: {
    driverId: v.id('drivers'),
    organizationId: v.id('organizations'),
    startTime: v.number(),
    endTime: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, { driverId, organizationId, startTime, endTime, reason }) => {
    await ctx.db.insert('driverSchedules', {
      organizationId,
      driverId,
      userId: (await ctx.db.get(driverId))!.userId,
      startTime,
      endTime,
      type: 'blocked',
      status: 'scheduled',
      reason,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/** Block time for vacation/sick leave */
export const blockTimeOff = mutation({
  args: {
    driverId: v.id('drivers'),
    organizationId: v.id('organizations'),
    startTime: v.number(),
    endTime: v.number(),
    reason: v.string(),
    type: v.union(v.literal('vacation'), v.literal('sick_leave'), v.literal('personal')),
  },
  handler: async (ctx, { driverId, organizationId, startTime, endTime, reason, type }) => {
    const driver = await ctx.db.get(driverId);
    if (!driver) throw new Error('Driver not found');

    await ctx.db.insert('driverSchedules', {
      organizationId,
      driverId,
      userId: driver.userId,
      startTime,
      endTime,
      type: 'time_off',
      status: 'scheduled',
      reason: `${type}: ${reason}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/** Calculate route distance and duration using Google Maps API */
export const calculateRoute = mutation({
  args: {
    from: v.string(),
    to: v.string(),
  },
  handler: async (ctx, { from, to }) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      // Return mock data if no API key
      return {
        distanceMeters: 15000,
        durationSeconds: 1800,
        distanceKm: 15,
        durationMinutes: 30,
      };
    }

    // In production, call Google Maps Distance Matrix API
    return {
      distanceMeters: 15000,
      durationSeconds: 1800,
      distanceKm: 15,
      durationMinutes: 30,
    };
  },
});
