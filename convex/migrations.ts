/**
 * Migrations for fixing duplicate users
 */

import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// Fix duplicate users — merge users with same email
// ─────────────────────────────────────────────────────────────────────────────
export const fixDuplicateUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    
    // Group by email
    const emailMap = new Map<string, typeof allUsers>();
    
    for (const user of allUsers) {
      const email = user.email.toLowerCase();
      const existing = emailMap.get(email) || [];
      existing.push(user);
      emailMap.set(email, existing);
    }
    
    let fixedCount = 0;
    
    for (const [email, users] of emailMap.entries()) {
      if (users.length <= 1) continue;
      
      console.log(`[fixDuplicateUsers] Found ${users.length} users with email ${email}`);
      
      // Find the approved user (prefer approved over non-approved)
      const approvedUser = users.find(u => u.isApproved);
      const nonApprovedUsers = users.filter(u => u !== approvedUser);
      
      if (approvedUser && nonApprovedUsers.length > 0) {
        // Delete non-approved duplicates
        for (const dupUser of nonApprovedUsers) {
          console.log(`[fixDuplicateUsers] Deleting duplicate user ${dupUser._id}`);
          await ctx.db.delete(dupUser._id);
          fixedCount++;
        }
        console.log(`[fixDuplicateUsers] Kept approved user ${approvedUser._id}`);
      } else {
        // No approved user — keep the one with organizationId
        const userWithOrg = users.find(u => u.organizationId);
        const usersWithoutOrg = users.filter(u => u !== userWithOrg);
        
        if (userWithOrg && usersWithoutOrg.length > 0) {
          for (const dupUser of usersWithoutOrg) {
            console.log(`[fixDuplicateUsers] Deleting duplicate user ${dupUser._id}`);
            await ctx.db.delete(dupUser._id);
            fixedCount++;
          }
        }
      }
    }
    
    console.log(`[fixDuplicateUsers] Fixed ${fixedCount} duplicate users`);
    return { fixed: fixedCount };
  },
});
