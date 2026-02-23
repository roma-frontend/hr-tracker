"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users, Clock, CheckCircle, UserCheck,
  Plus, CalendarDays, ArrowRight, TrendingUp,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import Link from "next/link";
import { format, isSameMonth } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthStore } from "@/store/useAuthStore";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEAVE_TYPE_LABELS, LEAVE_TYPE_COLORS, type LeaveType, type LeaveStatus } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function StatusBadge({ status }: { status: LeaveStatus }) {
  const variants: Record<LeaveStatus, "warning" | "success" | "destructive"> = {
    pending: "warning", approved: "success", rejected: "destructive",
  };
  return <Badge variant={variants[status]} className="capitalize">{status}</Badge>;
}

function LeaveTypeBadge({ type }: { type: LeaveType }) {
  const colorMap: Record<LeaveType, string> = {
    paid: "bg-[#6366f1]/20 text-[#6366f1] border-[#6366f1]/30",
    unpaid: "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30",
    sick: "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30",
    family: "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30",
    doctor: "bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/30",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorMap[type]}`}>
      {LEAVE_TYPE_LABELS[type]}
    </span>
  );
}

export function DashboardClient() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  const leaves = useQuery(api.leaves.getAllLeaves, {});
  const users = useQuery(api.users.getAllUsers, {});

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const totalEmployees = users?.length ?? 0;
  const pendingRequests = leaves?.filter((r) => r.status === "pending").length ?? 0;
  const onLeaveNow = leaves?.filter(
    (r) => r.status === "approved" && r.startDate <= todayStr && r.endDate >= todayStr
  ).length ?? 0;
  const approvedThisMonth = leaves?.filter(
    (r) => r.status === "approved" && isSameMonth(new Date(r.startDate), today)
  ).length ?? 0;

  const recentLeaves = leaves?.slice(0, 6) ?? [];

  // Build pie data
  const pieData = (Object.keys(LEAVE_TYPE_COLORS) as LeaveType[]).map((key) => ({
    name: LEAVE_TYPE_LABELS[key],
    value: leaves?.filter((r) => r.type === key).length ?? 0,
    color: LEAVE_TYPE_COLORS[key],
  })).filter((d) => d.value > 0);

  // Build monthly trend from real data
  const monthlyTrend = React.useMemo(() => {
    const months: Record<string, { month: string; approved: number; pending: number; rejected: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = format(d, "MMM");
      months[format(d, "yyyy-MM")] = { month: key, approved: 0, pending: 0, rejected: 0 };
    }
    leaves?.forEach((l) => {
      const key = l.startDate.slice(0, 7);
      if (months[key]) {
        months[key][l.status as "approved" | "pending" | "rejected"]++;
      }
    });
    return Object.values(months);
  }, [leaves]);

  if (!mounted) return null;

  const isLoading = leaves === undefined || users === undefined;
  const isError = leaves === null || users === null;

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
        <TrendingUp className="w-8 h-8 text-amber-500" />
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">Convex Not Deployed</h2>
      <p className="text-[var(--text-muted)] text-sm max-w-sm">
        Run <code className="bg-[var(--background-subtle)] px-2 py-0.5 rounded text-[#6366f1]">npx convex dev</code> in the terminal to connect to the database.
      </p>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Welcome header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Welcome back, {user?.name?.split(" ")[0] ?? "Admin"} 👋
          </h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {format(today, "EEEE, MMMM d, yyyy")} · Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild size="sm" variant="outline">
            <Link href="/calendar"><CalendarDays className="w-4 h-4" />Calendar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/leaves"><Plus className="w-4 h-4" />New Request</Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Employees" value={isLoading ? "—" : totalEmployees} icon={<Users className="w-5 h-5" />} color="blue" index={0} />
        <StatsCard title="Pending Requests" value={isLoading ? "—" : pendingRequests} icon={<Clock className="w-5 h-5" />} color="yellow" index={1} />
        <StatsCard title="Approved This Month" value={isLoading ? "—" : approvedThisMonth} icon={<CheckCircle className="w-5 h-5" />} color="green" index={2} />
        <StatsCard title="On Leave Now" value={isLoading ? "—" : onLeaveNow} icon={<UserCheck className="w-5 h-5" />} color="purple" index={3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Monthly Leave Trend</CardTitle>
                <TrendingUp className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} cursor={{ fill: "rgba(99,102,241,0.05)" }} />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "var(--text-muted)" }} />
                  <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Leave Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="transparent" />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                          <span className="text-[var(--text-muted)] truncate">{entry.name}</span>
                        </div>
                        <span className="text-[var(--text-primary)] font-medium ml-2">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-40 text-[var(--text-muted)] text-sm">No data yet</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent requests */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Recent Leave Requests</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-[#6366f1] hover:text-[#6366f1]">
                <Link href="/leaves">View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm">Loading...</div>
            ) : recentLeaves.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm">No leave requests yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Employee</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">Dates</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden sm:table-cell">Days</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {recentLeaves.map((req, i) => (
                      <motion.tr
                        key={req._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[var(--background-subtle)] transition-colors"
                      >
                        <td className="px-6 py-3">
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{req.userName ?? "Unknown"}</p>
                            <p className="text-xs text-[var(--text-muted)]">{req.userDepartment ?? ""}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3"><LeaveTypeBadge type={req.type as LeaveType} /></td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-xs text-[var(--text-secondary)]">
                            {format(new Date(req.startDate), "MMM d")} – {format(new Date(req.endDate), "MMM d, yyyy")}
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-sm font-medium text-[var(--text-primary)]">{req.days}d</span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={req.status as LeaveStatus} /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button asChild variant="outline" className="h-14 flex-col gap-1 border-[var(--border)] hover:border-[#6366f1]">
            <Link href="/leaves"><Plus className="w-5 h-5 text-[#6366f1]" /><span className="text-xs">New Leave Request</span></Link>
          </Button>
          <Button asChild variant="outline" className="h-14 flex-col gap-1 border-[var(--border)] hover:border-[#10b981]">
            <Link href="/employees"><Users className="w-5 h-5 text-[#10b981]" /><span className="text-xs">Add Employee</span></Link>
          </Button>
          <Button asChild variant="outline" className="h-14 flex-col gap-1 border-[var(--border)] hover:border-[#8b5cf6]">
            <Link href="/calendar"><CalendarDays className="w-5 h-5 text-[#8b5cf6]" /><span className="text-xs">View Calendar</span></Link>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
