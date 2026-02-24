import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get cost analysis data for admin dashboard
 */
export const getCostAnalysis = query({
  args: {
    period: v.optional(v.union(v.literal("month"), v.literal("quarter"), v.literal("year"))),
  },
  handler: async (ctx, args) => {
    const period = args.period || "month";
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "quarter") {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }
    
    const startTimestamp = startDate.getTime();
    
    // Get all approved leave requests in the period
    const leaves = await ctx.db
      .query("leaveRequests")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "approved"),
          q.gte(q.field("createdAt"), startTimestamp)
        )
      )
      .collect();
    
    // Get all users
    const users = await ctx.db.query("users").collect();
    const userMap = new Map(users.map(u => [u._id, u]));
    
    // Calculate costs by department
    const departmentCosts = new Map<string, number>();
    const typeCosts = new Map<string, number>();
    let totalCost = 0;
    
    for (const leave of leaves) {
      const user = userMap.get(leave.userId);
      if (!user) continue;
      
      // Simplified cost calculation: assume average daily cost
      // In reality, you'd want to store salary information
      const dailyCost = user.employeeType === "contractor" ? 150 : 200; // USD per day
      const cost = leave.days * dailyCost;
      
      totalCost += cost;
      
      // By department
      const dept = user.department || "Unknown";
      departmentCosts.set(dept, (departmentCosts.get(dept) || 0) + cost);
      
      // By type
      typeCosts.set(leave.type, (typeCosts.get(leave.type) || 0) + cost);
    }
    
    return {
      totalCost,
      byDepartment: Array.from(departmentCosts.entries()).map(([name, cost]) => ({
        name,
        cost,
        percentage: (cost / totalCost) * 100,
      })),
      byType: Array.from(typeCosts.entries()).map(([type, cost]) => ({
        type,
        cost,
        percentage: (cost / totalCost) * 100,
      })),
      totalDays: leaves.reduce((sum, l) => sum + l.days, 0),
      totalLeaves: leaves.length,
    };
  },
});

/**
 * Detect conflicts in leave schedules
 */
export const detectConflicts = query({
  args: {},
  handler: async (ctx) => {
    // Get all approved and pending leaves
    const leaves = await ctx.db
      .query("leaveRequests")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "approved"),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();
    
    // Get all users
    const users = await ctx.db.query("users").collect();
    const userMap = new Map(users.map(u => [u._id, u]));
    
    // Group by department and date
    const conflicts: Array<{
      id: string;
      department: string;
      date: string;
      employeesOut: string[];
      severity: "critical" | "warning" | "info";
      recommendation: string;
    }> = [];
    
    // Group leaves by department
    const deptLeaves = new Map<string, typeof leaves>();
    for (const leave of leaves) {
      const user = userMap.get(leave.userId);
      if (!user) continue;
      
      const dept = user.department || "Unknown";
      if (!deptLeaves.has(dept)) {
        deptLeaves.set(dept, []);
      }
      deptLeaves.get(dept)!.push(leave);
    }
    
    // Check each department for conflicts
    for (const [dept, deptLeaveList] of deptLeaves.entries()) {
      // Get department size
      const deptUsers = users.filter(u => (u.department || "Unknown") === dept);
      const deptSize = deptUsers.length;
      
      // Check each day for overlaps
      const dateOverlaps = new Map<string, Set<string>>();
      
      for (const leave of deptLeaveList) {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          if (!dateOverlaps.has(dateStr)) {
            dateOverlaps.set(dateStr, new Set());
          }
          const user = userMap.get(leave.userId);
          if (user) {
            dateOverlaps.get(dateStr)!.add(user.name);
          }
        }
      }
      
      // Identify conflicts
      for (const [date, employeesOut] of dateOverlaps.entries()) {
        const outCount = employeesOut.size;
        const percentage = (outCount / deptSize) * 100;
        
        if (percentage >= 50) {
          conflicts.push({
            id: `${dept}-${date}`,
            department: dept,
            date,
            employeesOut: Array.from(employeesOut),
            severity: "critical",
            recommendation: `Critical: ${outCount}/${deptSize} employees out (${percentage.toFixed(0)}%). Consider rescheduling some leaves.`,
          });
        } else if (percentage >= 30) {
          conflicts.push({
            id: `${dept}-${date}`,
            department: dept,
            date,
            employeesOut: Array.from(employeesOut),
            severity: "warning",
            recommendation: `Warning: ${outCount}/${deptSize} employees out (${percentage.toFixed(0)}%). Monitor workload.`,
          });
        }
      }
    }
    
    return conflicts.sort((a, b) => {
      if (a.severity === b.severity) return a.date.localeCompare(b.date);
      return a.severity === "critical" ? -1 : 1;
    });
  },
});

/**
 * Get smart suggestions for leave scheduling
 */
export const getSmartSuggestions = query({
  args: {},
  handler: async (ctx) => {
    const suggestions: Array<{
      id: string;
      title: string;
      description: string;
      impact: "high" | "medium" | "low";
      category: "optimization" | "cost" | "conflict" | "policy";
    }> = [];
    
    // Get all users and leaves
    const users = await ctx.db.query("users").collect();
    const leaves = await ctx.db
      .query("leaveRequests")
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();
    
    // Suggestion 1: Users with high leave balances
    const highBalanceUsers = users.filter(u => {
      const totalBalance = u.paidLeaveBalance + u.sickLeaveBalance + u.familyLeaveBalance;
      return totalBalance > 30; // More than 30 days total
    });
    
    if (highBalanceUsers.length > 0) {
      suggestions.push({
        id: "high-balance",
        title: "Encourage Leave Usage",
        description: `${highBalanceUsers.length} employees have high leave balances (>30 days). Encourage them to use their leave to avoid year-end issues.`,
        impact: "medium",
        category: "policy",
      });
    }
    
    // Suggestion 2: Users with low balances
    const lowBalanceUsers = users.filter(u => {
      const totalBalance = u.paidLeaveBalance + u.sickLeaveBalance + u.familyLeaveBalance;
      return totalBalance < 5; // Less than 5 days total
    });
    
    if (lowBalanceUsers.length > 0) {
      suggestions.push({
        id: "low-balance",
        title: "Review Leave Policies",
        description: `${lowBalanceUsers.length} employees have very low leave balances (<5 days). Consider reviewing workload distribution.`,
        impact: "high",
        category: "policy",
      });
    }
    
    // Suggestion 3: Departments with no planned leaves
    const deptLeaves = new Map<string, number>();
    for (const leave of leaves) {
      const user = users.find(u => u._id === leave.userId);
      if (user) {
        const dept = user.department || "Unknown";
        deptLeaves.set(dept, (deptLeaves.get(dept) || 0) + 1);
      }
    }
    
    const allDepts = new Set(users.map(u => u.department || "Unknown"));
    const deptsWithoutLeaves = Array.from(allDepts).filter(d => !deptLeaves.has(d));
    
    if (deptsWithoutLeaves.length > 0) {
      suggestions.push({
        id: "no-planned-leaves",
        title: "Departments Without Planned Leaves",
        description: `${deptsWithoutLeaves.join(", ")} have no upcoming leaves. This might indicate burnout risk.`,
        impact: "medium",
        category: "optimization",
      });
    }
    
    // Suggestion 4: Cost optimization
    const contractorLeaves = leaves.filter(l => {
      const user = users.find(u => u._id === l.userId);
      return user?.employeeType === "contractor";
    });
    
    if (contractorLeaves.length > 0) {
      const totalDays = contractorLeaves.reduce((sum, l) => sum + l.days, 0);
      const estimatedCost = totalDays * 150; // $150/day for contractors
      
      suggestions.push({
        id: "contractor-costs",
        title: "Contractor Leave Costs",
        description: `${contractorLeaves.length} contractor leaves totaling ${totalDays} days. Estimated cost: $${estimatedCost.toLocaleString()}.`,
        impact: "high",
        category: "cost",
      });
    }
    
    return suggestions;
  },
});

/**
 * Get calendar export data
 */
export const getCalendarExportData = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all approved leaves
    const leaves = await ctx.db
      .query("leaveRequests")
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();
    
    // Get all users
    const users = await ctx.db.query("users").collect();
    const userMap = new Map(users.map(u => [u._id, u]));
    
    // Filter by date range if provided
    let filteredLeaves = leaves;
    if (args.startDate || args.endDate) {
      filteredLeaves = leaves.filter(leave => {
        if (args.startDate && leave.endDate < args.startDate) return false;
        if (args.endDate && leave.startDate > args.endDate) return false;
        return true;
      });
    }
    
    // Format for calendar export
    return filteredLeaves.map(leave => {
      const user = userMap.get(leave.userId);
      return {
        id: leave._id,
        title: `${user?.name || 'Unknown'} - ${leave.type} leave`,
        startDate: leave.startDate,
        endDate: leave.endDate,
        description: leave.reason,
        userName: user?.name || 'Unknown',
        department: user?.department || 'Unknown',
        type: leave.type,
      };
    });
  },
});
