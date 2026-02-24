"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, AlertTriangle, Award, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";

export function AttendanceDashboard() {
  const { user } = useAuthStore();
  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-02"

  const monthlyStats = useQuery(
    api.timeTracking.getMonthlyStats,
    user?.id ? { userId: user.id as any, month: currentMonth } : "skip"
  );

  const history = useQuery(
    api.timeTracking.getUserHistory,
    user?.id ? { userId: user.id as any, limit: 10 } : "skip"
  );

  if (!monthlyStats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-[var(--text-muted)]">Loading attendance data...</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "Days Worked",
      value: monthlyStats.totalDays,
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Total Hours",
      value: `${monthlyStats.totalWorkedHours}h`,
      icon: Clock,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      label: "Punctuality",
      value: `${monthlyStats.punctualityRate}%`,
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      label: "Overtime",
      value: `${monthlyStats.totalOvertimeHours}h`,
      icon: Award,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Monthly Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Monthly Attendance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={stat.bgColor}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--text-muted)] mb-1">{stat.label}</p>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <stat.icon className={`w-10 h-10 ${stat.color} opacity-50`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Issues Alert */}
      {(Number(monthlyStats.lateDays) > 0 || Number(monthlyStats.earlyLeaveDays) > 0) && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="w-5 h-5" />
              Attendance Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Number(monthlyStats.lateDays) > 0 && (
                <p className="text-orange-700 dark:text-orange-300">
                  • {monthlyStats.lateDays} late arrival(s) this month
                </p>
              )}
              {Number(monthlyStats.earlyLeaveDays) > 0 && (
                <p className="text-orange-700 dark:text-orange-300">
                  • {monthlyStats.earlyLeaveDays} early leave(s) this month
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {!history || history.length === 0 ? (
            <p className="text-center text-[var(--text-muted)] py-4">
              No attendance records yet
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record._id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                  style={{ borderColor: "var(--border)", background: "var(--background-subtle)" }}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                        {format(new Date(record.date), "MMMM dd, yyyy")}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {record.checkInTime
                          ? format(new Date(record.checkInTime), "HH:mm")
                          : "—"}{" "}
                        →{" "}
                        {record.checkOutTime
                          ? format(new Date(record.checkOutTime), "HH:mm")
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {record.status === "checked_in" && (
                      <Badge className="bg-green-500 text-white">In Progress</Badge>
                    )}
                    {record.status === "checked_out" && record.totalWorkedMinutes && (
                      <Badge variant="secondary">
                        {Math.floor(record.totalWorkedMinutes / 60)}h{" "}
                        {record.totalWorkedMinutes % 60}m
                      </Badge>
                    )}
                    {record.isLate && <Badge variant="destructive">Late</Badge>}
                    {record.isEarlyLeave && <Badge className="bg-orange-500 text-white">Early</Badge>}
                    {record.overtimeMinutes && record.overtimeMinutes > 0 && (
                      <Badge className="bg-purple-500 text-white">
                        +{Math.floor(record.overtimeMinutes / 60)}h OT
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AttendanceDashboard;
