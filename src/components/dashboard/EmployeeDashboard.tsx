"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, Plus, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { LEAVE_TYPE_LABELS, type LeaveType, type LeaveStatus } from "@/lib/types";

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
    pending: "warning",
    approved: "success",
    rejected: "destructive",
  };
  return <Badge variant={variants[status]} className="capitalize">{status}</Badge>;
}

export function EmployeeDashboard() {
  const { user } = useAuthStore();
  const leaves = useQuery(api.leaves.getAllLeaves, {});
  const userData = useQuery(
    api.users.getUserById,
    user?.id ? { userId: user.id as any } : "skip"
  );

  const today = new Date();
  const myLeaves = leaves?.filter((l) => l.userId === user?.id) ?? [];
  const pendingLeaves = myLeaves.filter((l) => l.status === "pending");
  const approvedLeaves = myLeaves.filter((l) => l.status === "approved");
  const rejectedLeaves = myLeaves.filter((l) => l.status === "rejected");

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Welcome header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Welcome, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {format(today, "EEEE, MMMM d, yyyy")}
        </p>
      </motion.div>

      {/* Leave Balances */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-[var(--background-subtle)]">
                <p className="text-2xl font-bold text-[#6366f1]">{userData?.paidLeaveBalance ?? 0}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Paid Leave</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[var(--background-subtle)]">
                <p className="text-2xl font-bold text-[#ef4444]">{userData?.sickLeaveBalance ?? 0}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Sick Leave</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[var(--background-subtle)]">
                <p className="text-2xl font-bold text-[#10b981]">{userData?.familyLeaveBalance ?? 0}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Family Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#f59e0b]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{pendingLeaves.length}</p>
                  <p className="text-sm text-[var(--text-muted)]">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#10b981]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{approvedLeaves.length}</p>
                  <p className="text-sm text-[var(--text-muted)]">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-[#ef4444]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{rejectedLeaves.length}</p>
                  <p className="text-sm text-[var(--text-muted)]">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* My Leave Requests */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">My Leave Requests</CardTitle>
              <Button asChild size="sm">
                <Link href="/leaves">
                  <Plus className="w-4 h-4" />
                  New Request
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {myLeaves.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
                <p className="text-sm text-[var(--text-muted)]">No leave requests yet</p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/leaves">
                    <Plus className="w-4 h-4" />
                    Create Your First Request
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myLeaves.slice(0, 5).map((leave) => (
                  <div
                    key={leave._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--background-subtle)] transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {LEAVE_TYPE_LABELS[leave.type as LeaveType]}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {format(new Date(leave.startDate), "MMM d")} – {format(new Date(leave.endDate), "MMM d, yyyy")} ({leave.days} days)
                      </p>
                    </div>
                    <StatusBadge status={leave.status as LeaveStatus} />
                  </div>
                ))}
                {myLeaves.length > 5 && (
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/leaves">View all {myLeaves.length} requests</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
