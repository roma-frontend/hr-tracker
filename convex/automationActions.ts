/**
 * Automation - Actions (for operations with delays, external APIs, etc.)
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const runAutomation = action({
  args: {},
  handler: async (ctx) => {
    // Create a new automation task via internal mutation
    const taskId = await ctx.runMutation(internal.automationMutations.createAutomationTask, {
      name: "Manual automation run",
    });

    // Simulate automation execution with delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update task status via internal mutation
    await ctx.runMutation(internal.automationMutations.completeAutomationTask, {
      taskId: taskId as any,
    });

    return { success: true, taskId };
  },
});
