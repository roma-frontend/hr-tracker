"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthStore } from "@/store/useAuthStore";
import { LeavesTrendChart } from "@/components/analytics/LeavesTrendChart";
import { DepartmentStats } from "@/components/analytics/DepartmentStats";
import { LeaveHeatmap } from "@/components/analytics/LeaveHeatmap";
import { StatsCard } from "@/components/analytics/StatsCard";
import { Users, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const analytics = useQuery(api.analytics.getAnalyticsOverview, {});

  // Only admin and supervisor can access
  if (user && user.role === "employee") {
    redirect("/dashboard");
  }

  if (!analytics) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 bg-[var(--background-subtle)] animate-pulse rounded-lg w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-[var(--background-subtle)] animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-96 bg-[var(--background-subtle)] animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { 
    totalEmployees, 
    pendingApprovals, 
    totalLeaves, 
    pendingLeaves, 
    approvedLeaves,
    avgApprovalTime,
    users: allUsers,
    leaves: allLeaves,
  } = analytics;

  const approvalRate = totalLeaves > 0 ? ((approvedLeaves / totalLeaves) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            📊 Analytics Dashboard
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Overview of your HR metrics and insights
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value={totalEmployees}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Pending Approvals"
          value={pendingApprovals}
          icon={AlertCircle}
          color="yellow"
        />
        <StatsCard
          title="Leave Requests"
          value={totalLeaves}
          icon={CheckCircle}
          color="purple"
        />
        <StatsCard
          title="Avg. Approval Time"
          value={`${avgApprovalTime}h`}
          icon={Clock}
          color="green"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--background)] rounded-2xl p-6 shadow-lg border border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Pending Leaves</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500 mt-1">{pendingLeaves}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--background)] rounded-2xl p-6 shadow-lg border border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Approved Leaves</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500 mt-1">{approvedLeaves}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--background)] rounded-2xl p-6 shadow-lg border border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Approval Rate</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-500 mt-1">{approvalRate}%</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeavesTrendChart leaves={allLeaves} />
        <DepartmentStats users={allUsers} />
      </div>

      {/* Heatmap */}
      <LeaveHeatmap leaves={allLeaves} />
    </div>
  );
}
