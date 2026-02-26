"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

type PresenceStatus = "available" | "in_meeting" | "in_call" | "out_of_office" | "busy";

const PRESENCE_CONFIG: Record<PresenceStatus, { label: string; color: string; bg: string; dot: string; icon: string }> = {
  available:     { label: "Available",     color: "text-emerald-600", bg: "bg-emerald-50",  dot: "bg-emerald-500", icon: "🟢" },
  in_meeting:    { label: "In Meeting",    color: "text-amber-600",   bg: "bg-amber-50",    dot: "bg-amber-500",   icon: "📅" },
  in_call:       { label: "In Call",       color: "text-blue-600",    bg: "bg-blue-50",     dot: "bg-blue-500",    icon: "📞" },
  out_of_office: { label: "Out of Office", color: "text-rose-600",    bg: "bg-rose-50",     dot: "bg-rose-500",    icon: "🏠" },
  busy:          { label: "Busy",          color: "text-orange-600",  bg: "bg-orange-50",   dot: "bg-orange-500",  icon: "⛔" },
};

interface Props {
  employee: any;
  children: React.ReactNode;
  canEditStatus?: boolean;
  currentUserId?: string;
  userRole?: string;
  allUsers?: any[];
}

export function EmployeeHoverCard({ employee, children, canEditStatus = false, currentUserId, userRole, allUsers }: Props) {
  const isAdmin = userRole === "admin";
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<"right" | "left">("right");
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const updatePresence = useMutation(api.users.updatePresenceStatus);

  // Find supervisor from allUsers list — no extra query
  const supervisor = allUsers?.find((u: any) => u._id === employee.supervisorId);

  // Get task count for employee
  const taskCount = useQuery(
    api.tasks.getTasksForEmployee,
    open ? { userId: employee._id as Id<"users"> } : "skip"
  );

  const activeTasks = (taskCount ?? []).filter((t: any) =>
    t.status === "in_progress" || t.status === "pending"
  ).length;

  const presence = (employee.presenceStatus ?? "available") as PresenceStatus;
  const presenceCfg = PRESENCE_CONFIG[presence];

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    // Detect position
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPos(rect.right + 320 > window.innerWidth ? "left" : "right");
    }
    timerRef.current = setTimeout(() => setOpen(true), 1000);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 200);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handlePresenceChange = async (status: PresenceStatus) => {
    await updatePresence({ userId: employee._id as Id<"users">, status });
  };

  const initials = (employee.name ?? "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div
      ref={containerRef}
      className="relative inline-block w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onMouseEnter={() => clearTimeout(timerRef.current)}
            onMouseLeave={handleMouseLeave}
            className="fixed z-[9999] w-[300px]"
            style={(() => {
              if (!containerRef.current) return {};
              const rect = containerRef.current.getBoundingClientRect();
              const cardW = 300;
              const cardH = 500;
              const margin = 10;

              // Vertical: center on element, clamp to screen
              const idealTop = rect.top + rect.height / 2 - cardH / 2;
              const top = Math.max(margin, Math.min(idealTop, window.innerHeight - cardH - margin));

              // Horizontal: prefer right side, fallback to left, clamp to screen
              let left = rect.right + margin;
              if (left + cardW > window.innerWidth - margin) {
                left = rect.left - cardW - margin;
              }
              // Final clamp — never go off left edge
              left = Math.max(margin, left);

              return {
                top,
                left,
                filter: "drop-shadow(0 12px 40px rgba(99,102,241,0.22))",
              };
            })()}
          >
            <div className="bg-white rounded-2xl overflow-hidden border border-blue-100">
              {/* Header gradient with avatar + name inside */}
              <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-pink-500 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${presenceCfg.bg} ${presenceCfg.color}`}>
                    <span className="mr-1">{presenceCfg.icon}</span>{presenceCfg.label}
                  </span>
                  {activeTasks > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">
                      📋 {activeTasks} task{activeTasks > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/60 shadow-lg flex-shrink-0 bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                    {employee.avatarUrl ? (
                      <img src={employee.avatarUrl} alt={employee.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{employee.name}</h3>
                    <p className="text-white/70 text-sm">{employee.position ?? employee.role}</p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="px-4 pb-4 pt-3">
                {/* Info rows */}
                <div className="space-y-2.5">
                  {employee.email && (
                    <a
                      href={`mailto:${employee.email}`}
                      className="flex items-center gap-2.5 group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors flex-shrink-0">✉️</span>
                      <span className="text-sm text-slate-600 group-hover:text-blue-600 transition-colors truncate">{employee.email}</span>
                    </a>
                  )}

                  {employee.phone && (
                    <a
                      href={`tel:${employee.phone}`}
                      className="flex items-center gap-2.5 group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 transition-colors flex-shrink-0">📞</span>
                      <span className="text-sm text-slate-600 group-hover:text-emerald-600 transition-colors">{employee.phone}</span>
                    </a>
                  )}

                  {employee.department && (
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">🏢</span>
                      <span className="text-sm text-slate-600">{employee.department}</span>
                    </div>
                  )}

                  {supervisor && (
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-400 flex-shrink-0">👤</span>
                      <div>
                        <span className="text-xs text-slate-400 block">Supervisor</span>
                        <span className="text-sm font-medium text-sky-500">
                          {supervisor.name && supervisor.name !== "admin"
                            ? supervisor.name
                            : supervisor.email?.split("@")[0] ?? "Admin"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Financial info — admin only */}
                  {isAdmin && employee.travelAllowance != null && (
                    <div className="mt-1 pt-2.5 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Finance (Admin only)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {employee.travelAllowance != null && (
                          <div className="bg-amber-50 rounded-xl p-2.5">
                            <p className="text-xs text-amber-500 font-medium">✈️ Travel</p>
                            <p className="text-sm font-bold text-amber-700">{employee.travelAllowance.toLocaleString()} AMD</p>
                          </div>
                        )}
                        {employee.sickLeaveBudget != null && (
                          <div className="bg-rose-50 rounded-xl p-2.5">
                            <p className="text-xs text-rose-500 font-medium">🏥 Sick Leave</p>
                            <p className="text-sm font-bold text-rose-700">{employee.sickLeaveBudget.toLocaleString()} AMD</p>
                          </div>
                        )}
                        {employee.vacationBudget != null && (
                          <div className="bg-blue-50 rounded-xl p-2.5">
                            <p className="text-xs text-blue-500 font-medium">🏖️ Vacation</p>
                            <p className="text-sm font-bold text-blue-700">{employee.vacationBudget.toLocaleString()} AMD</p>
                          </div>
                        )}
                        {employee.salary != null && (
                          <div className="bg-emerald-50 rounded-xl p-2.5">
                            <p className="text-xs text-emerald-500 font-medium">💰 Salary</p>
                            <p className="text-sm font-bold text-emerald-700">{employee.salary.toLocaleString()} AMD</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Presence selector — only for self or admin */}
                {canEditStatus && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-2 font-medium">Set Status</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.entries(PRESENCE_CONFIG) as [PresenceStatus, typeof PRESENCE_CONFIG[PresenceStatus]][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => handlePresenceChange(key)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                            presence === key
                              ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1 ring-current`
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {cfg.icon} {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
