import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Register face descriptor for a user
export const registerFace = mutation({
  args: {
    userId: v.id("users"),
    faceDescriptor: v.array(v.number()),
    faceImageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user with face data
    // Also set avatarUrl if not already set, so face photo shows as avatar everywhere
    const updateData: any = {
      faceDescriptor: args.faceDescriptor,
      faceImageUrl: args.faceImageUrl,
      faceRegisteredAt: Date.now(),
    };
    if (!user.avatarUrl) {
      updateData.avatarUrl = args.faceImageUrl;
    }
    await ctx.db.patch(args.userId, updateData);

    return { success: true };
  },
});

// Get user's face descriptor
export const getFaceDescriptor = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    return {
      faceDescriptor: user.faceDescriptor,
      faceImageUrl: user.faceImageUrl,
      faceRegisteredAt: user.faceRegisteredAt,
    };
  },
});

// Get all users with registered faces (for face matching during login)
export const getAllFaceDescriptors = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    return users
      .filter((user) => user.faceDescriptor && user.isActive)
      .map((user) => ({
        userId: user._id,
        name: user.name,
        email: user.email,
        faceDescriptor: user.faceDescriptor!,
      }));
  },
});

// Remove face registration
export const removeFaceRegistration = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      faceDescriptor: undefined,
      faceImageUrl: undefined,
      faceRegisteredAt: undefined,
    });

    return { success: true };
  },
});

// Verify face login attempt
export const verifyFaceLogin = mutation({
  args: {
    userId: v.id("users"),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    // Update last login
    await ctx.db.patch(args.userId, {
      lastLoginAt: Date.now(),
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: "face_login",
      details: "User logged in via Face ID",
      ip: args.ip,
      createdAt: Date.now(),
    });

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      employeeType: user.employeeType,
      avatar: user.avatarUrl,
    };
  },
});
