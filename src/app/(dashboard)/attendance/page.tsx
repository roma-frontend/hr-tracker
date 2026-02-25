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
import { EmployeeAttendanceDrawer } from "@/components/attendance/EmployeeAttendanceDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, UserCheck, BarChart2, CalendarDays, TrendingUp, Search } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

type Tab = "today" | "all_employees" | "rating";

export default function AttendancePage() {
  const { user } = useAuthStore();
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: Id<"users">; name: string } | null>(null);
  const [detailRecord, setDetailRecord] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [drawerEmployee, setDrawerEmployee] = useState<any | null>(null);
  const [empSearch, setEmpSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

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

  const allEmployeesOverview = useQuery(
    api.timeTracking.getAllEmployeesAttendanceOverview,
    mounted && isAdminOrSupervisor ? { month: selectedMonth } : "skip"
  );

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
    return d.toISOString().slice(0, 7);
  });

  const filteredEmployees = (allEmployeesOverview ?? []).filter(e =>
    !empSearch || e.user.name.toLowerCase().includes(empSearch.toLowerCase()) ||
    (e.user.department ?? "").toLowerCase().includes(empSearch.toLowerCase())
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

      {/* Tabs for Admin/Supervisor */}
      {isAdminOrSupervisor && (
        <motion.div variants={itemVariants}>
          <div className="flex gap-1 bg-slate-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
            {([
              { id: "today", label: "Today", icon: Clock },
              { id: "all_employees", label: "All Employees", icon: Users },
              { id: "rating", label: "Rating", icon: Star },
            ] as { id: Tab; label: string; icon: any }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-900 text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "rating" && needsRating && needsRating.length > 0 && (
                  <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {needsRating.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Admin/Supervisor: Today's overview */}
      {isAdminOrSupervisor && activeTab === "today" && todaySummary !== undefined && (
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border border-green-200 dark:border-green-800">
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-green-500">{todaySummary.checkedIn}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">At Work Now</p>
              </CardContent>
            </Card>
            <Card className="border border-blue-200 dark:border-blue-800">
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-blue-500">{todaySummary.checkedOut}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Left Today</p>
              </CardContent>
            </Card>
            <Card className="border border-red-200 dark:border-red-800">
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-red-500">{todaySummary.absent}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Absent</p>
              </CardContent>
            </Card>
            <Card className="border border-orange-200 dark:border-orange-800">
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-orange-500">{todaySummary.late}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Late Arrivals</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Admin/Supervisor: Today's full attendance list */}
      {isAdminOrSupervisor && activeTab === "today" && todayAllAttendance !== undefined && (
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
                        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-sm font-bold">
                          {record.user?.avatarUrl ? (
                            <img src={record.user.avatarUrl} alt={record.user.name ?? ""} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            record.user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"
                          )}
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

      {/* All Employees Tab */}
      {isAdminOrSupervisor && activeTab === "all_employees" && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                Attendance Overview
                <div className="ml-auto flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      value={empSearch}
                      onChange={e => setEmpSearch(e.target.value)}
                      placeholder="Search..."
                      className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 w-36"
                    />
                  </div>
                  {/* Month */}
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  >
                    {monthOptions.map(m => {
                      const [y, mo] = m.split("-").map(Number);
                      return <option key={m} value={m}>{MONTHS[mo-1]} {y}</option>;
                    })}
                  </select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allEmployeesOverview === undefined ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-10 text-slate-400">No employees found</div>
              ) : (
                <div className="space-y-2">
                  {filteredEmployees.map(({ user: emp, supervisor, stats, lastRecord }) => (
                    <div
                      key={emp._id}
                      onClick={() => setDrawerEmployee({ ...emp, supervisorName: supervisor?.name })}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer transition-all group"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {emp.avatarUrl ? (
                          <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          emp.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 group-hover:text-indigo-700 transition-colors truncate">{emp.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          {emp.position && <span>{emp.position}</span>}
                          {supervisor && <span className="text-indigo-400">· {supervisor.name}</span>}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-4 text-center flex-shrink-0">
                        <div>
                          <p className="text-sm font-bold text-blue-600">{stats.totalDays}</p>
                          <p className="text-xs text-slate-400">Days</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-rose-500">{stats.lateDays}</p>
                          <p className="text-xs text-slate-400">Late</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-600">{stats.totalWorkedHours}h</p>
                          <p className="text-xs text-slate-400">Worked</p>
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${Number(stats.punctualityRate) >= 80 ? "text-emerald-600" : Number(stats.punctualityRate) >= 60 ? "text-amber-500" : "text-rose-500"}`}>
                            {stats.punctualityRate}%
                          </p>
                          <p className="text-xs text-slate-400">Punct.</p>
                        </div>
                      </div>

                      {/* Last record badge */}
                      <div className="flex-shrink-0">
                        {lastRecord?.status === "checked_in" ? (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium animate-pulse">● Active</span>
                        ) : lastRecord?.status === "checked_out" ? (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">Done</span>
                        ) : (
                          <span className="text-xs bg-slate-100 text-slate-400 px-2 py-1 rounded-full font-medium">—</span>
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
      {isAdminOrSupervisor && activeTab === "rating" && needsRating && needsRating.length > 0 && !selectedEmployee && (
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
                      <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        {employee.avatarUrl ? (
                          <img src={employee.avatarUrl} alt={employee.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          employee.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                        )}
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
      {isAdminOrSupervisor && activeTab === "rating" && selectedEmployee && (
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
      {isAdminOrSupervisor && activeTab === "rating" && needsRating && needsRating.length === 0 && !selectedEmployee && (
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

      {/* Employee Attendance History Drawer */}
      <EmployeeAttendanceDrawer
        employee={drawerEmployee}
        onClose={() => setDrawerEmployee(null)}
      />
    </motion.div>
  );
}
