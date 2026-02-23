"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, MoreVertical, Edit2, Trash2,
  Shield, Users, Briefcase, Mail, Phone, Building2,
  Crown, UserCheck, User, AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { AddEmployeeModal } from "./AddEmployeeModal";
import { EditEmployeeModal } from "./EditEmployeeModal";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { toast } from "sonner";

const ROLE_CONFIG = {
  admin: { label: "Admin", icon: Crown, color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  supervisor: { label: "Supervisor", icon: UserCheck, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  employee: { label: "Employee", icon: User, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

const TYPE_CONFIG = {
  staff: { label: "Staff", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  contractor: { label: "Contractor", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
};

export function EmployeesClient() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<typeof users extends (infer T)[] ? T : never | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const users = useQuery(api.users.getAllUsers, {});
  const deleteUser = useMutation(api.users.deleteUser);

  const isAdmin = user?.role === "admin";
  const isSupervisor = user?.role === "supervisor";
  const canManage = isAdmin || isSupervisor;

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.department ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (u.position ?? "").toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === "all" || u.role === filterRole;
      const matchType = filterType === "all" || u.employeeType === filterType;
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && u.isActive) ||
        (filterStatus === "inactive" && !u.isActive);
      return matchSearch && matchRole && matchType && matchStatus;
    });
  }, [users, search, filterRole, filterType, filterStatus]);

  const stats = useMemo(() => {
    if (!users) return { total: 0, staff: 0, contractors: 0, admins: 0, supervisors: 0 };
    const active = users.filter((u) => u.isActive);
    return {
      total: active.length,
      staff: active.filter((u) => u.employeeType === "staff").length,
      contractors: active.filter((u) => u.employeeType === "contractor").length,
      admins: active.filter((u) => u.role === "admin").length,
      supervisors: active.filter((u) => u.role === "supervisor").length,
    };
  }, [users]);

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser({ userId: userId as Id<"users"> });
      toast.success("Employee deactivated");
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate");
    }
  };

  if (!mounted) return null;
  if (users === undefined) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#6366f1", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Employees</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {stats.total} total · {stats.staff} staff · {stats.contractors} contractors
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Active", value: stats.total, icon: Users, color: "#6366f1" },
          { label: "Staff", value: stats.staff, icon: User, color: "#10b981" },
          { label: "Contractors", value: stats.contractors, icon: Briefcase, color: "#f59e0b" },
          { label: "Supervisors", value: stats.supervisors, icon: Shield, color: "#8b5cf6" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl border flex items-center gap-3"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${stat.color}20` }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: filterRole, setter: setFilterRole, options: ["all", "admin", "supervisor", "employee"], label: "Role" },
            { value: filterType, setter: setFilterType, options: ["all", "staff", "contractor"], label: "Type" },
            { value: filterStatus, setter: setFilterStatus, options: ["all", "active", "inactive"], label: "Status" },
          ].map(({ value, setter, options, label }) => (
            <select
              key={label}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="px-3 py-2 rounded-xl border text-sm outline-none capitalize"
              style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              {options.map((o) => <option key={o} value={o} className="capitalize">{o === "all" ? `All ${label}s` : o}</option>)}
            </select>
          ))}
        </div>
      </motion.div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((emp, i) => {
            const roleConf = ROLE_CONFIG[emp.role];
            const typeConf = TYPE_CONFIG[emp.employeeType];
            const RoleIcon = roleConf.icon;

            return (
              <motion.div
                key={emp._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="relative p-5 rounded-2xl border group"
                style={{
                  background: "var(--card)",
                  borderColor: emp.isActive ? "var(--border)" : "rgba(239,68,68,0.2)",
                  opacity: emp.isActive ? 1 : 0.6,
                }}
              >
                {/* Menu */}
                {canManage && emp.email !== "romangulanyan@gmail.com" || isAdmin ? (
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === emp._id ? null : emp._id)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      style={{ color: "var(--text-muted)", background: "var(--background-subtle)" }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {openMenuId === emp._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-8 w-40 rounded-xl border shadow-xl z-20 overflow-hidden"
                          style={{ background: "var(--card)", borderColor: "var(--border)" }}
                        >
                          <button
                            onClick={() => { setEditEmployee(emp as any); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                            style={{ color: "var(--text-primary)" }}
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          {isAdmin && emp.role !== "admin" && (
                            <button
                              onClick={() => { setDeleteConfirm(emp._id); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                              style={{ color: "#ef4444" }}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Deactivate
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : null}

                {/* Avatar + Name */}
                <div className="flex items-start gap-3 mb-4">
                  <AvatarUpload
                    userId={emp._id}
                    currentUrl={emp.avatarUrl}
                    name={emp.name}
                    size="md"
                    readonly={!canManage && emp._id !== user?.id}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>{emp.name}</h3>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{emp.position ?? "No position"}</p>
                    {/* Role badge */}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: roleConf.bg, color: roleConf.color }}>
                        <RoleIcon className="w-2.5 h-2.5" />
                        {roleConf.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                  {emp.department && (
                    <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                      <Building2 className="w-3 h-3 flex-shrink-0" />
                      <span>{emp.department}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: typeConf.bg, color: typeConf.color }}>
                    {typeConf.label}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    {emp.travelAllowance.toLocaleString()} AMD
                  </span>
                </div>

                {/* Inactive banner */}
                {!emp.isActive && (
                  <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.05)" }}>
                    <span className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                      DEACTIVATED
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
            <Users className="w-12 h-12 opacity-20" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No employees found</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddEmployeeModal open={showAddModal} onClose={() => setShowAddModal(false)} />

      {editEmployee && (
        <EditEmployeeModal
          employee={editEmployee as any}
          open={!!editEmployee}
          onClose={() => setEditEmployee(null)}
          currentUserRole={user?.role ?? "employee"}
        />
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative p-6 rounded-2xl border shadow-2xl max-w-sm w-full text-center"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(239,68,68,0.1)" }}>
                <AlertTriangle className="w-7 h-7" style={{ color: "#ef4444" }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Deactivate Employee?</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                This will disable their access. You can reactivate them later from the edit panel.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#ef4444" }}>
                  Deactivate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Close menu on outside click */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}
