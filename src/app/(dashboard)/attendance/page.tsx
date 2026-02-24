"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { CheckInOutWidget } from "@/components/attendance/CheckInOutWidget";
import { AttendanceDashboard } from "@/components/attendance/AttendanceDashboard";
import { SupervisorRatingForm } from "@/components/attendance/SupervisorRatingForm";
import { AttendanceDetailModal } from "@/components/attendance/AttendanceDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, UserCheck } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AttendancePage() {
  const { user } = useAuthStore();
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: Id<"users">; name: string } | null>(null);
  const [detailRecord, setDetailRecord] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const isAdminOrSupervisor = mounted && (user?.role === "admin" || user?.role === "supervisor");
  const isEmployee = mounted && user?.role === "employee";

  // Admin/Supervisor: fetch today's attendance summary and employees needing rating
  // Use user?.id as dependency so queries only run after localStorage hydration
  const todaySummary = useQuery(
    api.timeTracking.getTodayAttendanceSummary,
    mounted && user && (user.role === "admin" || user.role === "supervisor") ? {} : "skip"
  );
  const currentlyAtWork = useQuery(
    api.timeTracking.getCurrentlyAtWork,
    mounted && user && (user.role === "admin" || user.role === "supervisor") ? {} : "skip"
  );
  const todayAllAttendance = useQuery(
    api.timeTracking.getTodayAllAttendance,
    mounted && user && (user.role === "admin" || user.role === "supervisor") ? {} : "skip"
  );
  const needsRating = useQuery(
    api.supervisorRatings.getEmployeesNeedingRating,
    mounted && user?.id && (user.role === "admin" || user.role === "supervisor")
      ? { supervisorId: user.id as Id<"users"> }
      : "skip"
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          {isAdminOrSupervisor ? "Attendance Management" : "My Attendance"}
        </h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {isAdminOrSupervisor
            ? "Monitor employee attendance and manage performance ratings"
            : "Track your work hours and view your performance scores"}
        </p>
      </motion.div>

      {/* Employee: Check-In widget + full attendance dashboard */}
      {mounted && !isAdminOrSupervisor && (
        <>
          <motion.div variants={itemVariants}>
            <CheckInOutWidget />
          </motion.div>
          <motion.div variants={itemVariants}>
            <AttendanceDashboard />
          </motion.div>
        </>
      )}

      {/* Debug info — remove after fix */}
      {isAdminOrSupervisor && (
        <div className="text-xs p-3 rounded bg-yellow-100 text-yellow-900 font-mono">
          mounted: {String(mounted)} | role: {user?.role} | todaySummary: {JSON.stringify(todaySummary)} | todayAllAttendance: {JSON.stringify(todayAllAttendance?.length)} | needsRating: {JSON.stringify(needsRating?.length)}
        </div>
      )}

      {/* Admin/Supervisor: Today's overview — show even if all zeros */}
      {isAdminOrSupervisor && todaySummary !== undefined && (
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-green-500">{todaySummary.checkedIn}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">At Work Now</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-blue-500">{todaySummary.checkedOut}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Left Today</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-red-500">{todaySummary.absent}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Absent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-orange-500">{todaySummary.late}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Late Arrivals</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Admin/Supervisor: Today's full attendance list */}
      {isAdminOrSupervisor && todayAllAttendance !== undefined && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Today's Attendance — {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                <Badge className="ml-auto bg-blue-500/10 text-blue-500 border-blue-500/30">
                  {todayAllAttendance.length} recorded
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAllAttendance.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
                  <p className="text-sm text-[var(--text-muted)]">No attendance records yet today</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Employees will appear here once they check in</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAllAttendance.map((record) => (
                    <div
                      key={record._id}
                      className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ borderColor: "var(--border)", background: "var(--background-subtle)" }}
                      onClick={() => { setDetailRecord(record); setDetailOpen(true); }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-sm font-bold">
                          {record.user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            {record.user?.name ?? "Unknown"}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {record.status !== "absent" && record.checkInTime > 0
                              ? `In: ${new Date(record.checkInTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                              : ""}
                            {record.checkOutTime
                              ? ` · Out: ${new Date(record.checkOutTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                              : ""}
                            {record.totalWorkedMinutes
                              ? ` · ${(record.totalWorkedMinutes / 60).toFixed(1)}h worked`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.isLate && (
                          <Badge variant="destructive" className="text-xs">Late {record.lateMinutes}m</Badge>
                        )}
                        {record.isEarlyLeave && (
                          <Badge className="bg-orange-500 text-white text-xs">Early leave</Badge>
                        )}
                        {record.status === "checked_in" && (
                          <Badge className="bg-green-500 text-white text-xs">
                            <Clock className="w-3 h-3 mr-1" />Active
                          </Badge>
                        )}
                        {record.status === "checked_out" && (
                          <Badge className="bg-blue-500 text-white text-xs">Done</Badge>
                        )}
                        {record.status === "absent" && (
                          <Badge variant="destructive" className="text-xs">Absent</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Admin/Supervisor: Employees needing performance rating */}
      {isAdminOrSupervisor && needsRating && needsRating.length > 0 && !selectedEmployee && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                Employees Pending Rating ({needsRating.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {needsRating.map(({ employee, lastRated }) => (
                  <div
                    key={employee._id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ borderColor: "var(--border)", background: "var(--background-subtle)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        {employee.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {employee.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {employee.position ?? employee.department ?? "Employee"} · Last rated: {lastRated}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      onClick={() => setSelectedEmployee({ id: employee._id, name: employee.name })}
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Rate
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Rating form when employee selected */}
      {isAdminOrSupervisor && selectedEmployee && (
        <motion.div variants={itemVariants}>
          <SupervisorRatingForm
            employeeId={selectedEmployee.id}
            employeeName={selectedEmployee.name}
            onClose={() => setSelectedEmployee(null)}
            onSuccess={() => setSelectedEmployee(null)}
          />
        </motion.div>
      )}

      {/* Admin/Supervisor: no employees needing rating */}
      {isAdminOrSupervisor && needsRating && needsRating.length === 0 && !selectedEmployee && (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <UserCheck className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-[var(--text-primary)]">All employees rated this month! ✅</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Check back next month</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Attendance Detail Modal */}
      <AttendanceDetailModal
        record={detailRecord}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailRecord(null); }}
      />
    </motion.div>
  );
}
