"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, User, Mail, Phone, Briefcase, Building2, Shield } from "lucide-react";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { useAuthStore } from "@/store/useAuthStore";

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "employee";
  employeeType: "staff" | "contractor";
  department?: string;
  position?: string;
  phone?: string;
  avatarUrl?: string;
  supervisorId?: string;
  isActive: boolean;
  travelAllowance: number;
  paidLeaveBalance: number;
  sickLeaveBalance: number;
  familyLeaveBalance: number;
}

interface EditEmployeeModalProps {
  employee: Employee;
  open: boolean;
  onClose: () => void;
  currentUserRole: "admin" | "supervisor" | "employee";
}

const ADMIN_EMAIL = "romangulanyan@gmail.com";
const DEPARTMENTS = ["Engineering", "HR", "Finance", "Marketing", "Operations", "Sales", "Design", "Management", "Legal", "IT"];
const ALL_ROLES = [
  { value: "admin", label: "Admin", icon: "👑", description: "Full access" },
  { value: "supervisor", label: "Supervisor", icon: "🎯", description: "Manage team" },
  { value: "employee", label: "Employee", icon: "👤", description: "Basic access" },
];

export function EditEmployeeModal({ employee, open, onClose, currentUserRole }: EditEmployeeModalProps) {
  const updateUser = useMutation(api.users.updateUser);
  const supervisors = useQuery(api.users.getSupervisors, {});

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: employee.name,
    role: employee.role,
    employeeType: employee.employeeType,
    department: employee.department ?? "",
    position: employee.position ?? "",
    phone: employee.phone ?? "",
    supervisorId: employee.supervisorId ?? "",
    isActive: employee.isActive,
    paidLeaveBalance: employee.paidLeaveBalance,
    sickLeaveBalance: employee.sickLeaveBalance,
    familyLeaveBalance: employee.familyLeaveBalance,
  });

  const canEditRole = currentUserRole === "admin";
  const currentUser = useAuthStore((s) => s.user);
  // Only romangulanyan@gmail.com can assign admin role
  const isActualAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL;
  const ROLES = isActualAdmin ? ALL_ROLES : ALL_ROLES.filter((r) => r.value !== "admin");

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser({
        userId: employee._id as Id<"users">,
        name: form.name,
        role: form.role as "admin" | "supervisor" | "employee",
        employeeType: form.employeeType as "staff" | "contractor",
        department: form.department || undefined,
        position: form.position || undefined,
        phone: form.phone || undefined,
        supervisorId: form.supervisorId ? form.supervisorId as Id<"users"> : undefined,
        isActive: form.isActive,
        paidLeaveBalance: form.paidLeaveBalance,
        sickLeaveBalance: form.sickLeaveBalance,
        familyLeaveBalance: form.familyLeaveBalance,
      });
      toast.success("Employee updated successfully!");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <AvatarUpload
                  userId={employee._id}
                  currentUrl={employee.avatarUrl}
                  name={employee.name}
                  size="md"
                />
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Edit Employee</h2>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{employee.email}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl transition-colors hover:opacity-70" style={{ color: "var(--text-muted)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all"
                  style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* Role — admin only */}
              {canEditRole && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                    <Shield className="w-3.5 h-3.5" /> Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, role: r.value as "admin" | "supervisor" | "employee" }))}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition-all"
                        style={{
                          borderColor: form.role === r.value ? "#6366f1" : "var(--border)",
                          background: form.role === r.value ? "rgba(99,102,241,0.1)" : "var(--background-subtle)",
                          color: form.role === r.value ? "#6366f1" : "var(--text-muted)",
                        }}
                      >
                        <span className="text-lg">{r.icon}</span>
                        <span>{r.label}</span>
                        <span className="text-xs opacity-70">{r.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Employee Type */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                  <Briefcase className="w-3.5 h-3.5" /> Employee Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["staff", "contractor"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, employeeType: type as "staff" | "contractor" }))}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition-all"
                      style={{
                        borderColor: form.employeeType === type ? "#6366f1" : "var(--border)",
                        background: form.employeeType === type ? "rgba(99,102,241,0.1)" : "var(--background-subtle)",
                        color: form.employeeType === type ? "#6366f1" : "var(--text-muted)",
                      }}
                    >
                      <span className="capitalize">{type}</span>
                      <span className="text-xs opacity-70">
                        {type === "contractor" ? "12,000 AMD" : "20,000 AMD"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Department & Position */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                    <Building2 className="w-3.5 h-3.5" /> Department
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all"
                    style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  >
                    <option value="">Select...</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Position</label>
                  <input
                    value={form.position}
                    onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                    placeholder="e.g. Engineer"
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all"
                    style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                  <Phone className="w-3.5 h-3.5" /> Phone
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+374 XX XXX XXX"
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all"
                  style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* Leave Balances — admin only */}
              {canEditRole && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Leave Balances (days)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "paidLeaveBalance", label: "Paid", color: "#6366f1" },
                      { key: "sickLeaveBalance", label: "Sick", color: "#ef4444" },
                      { key: "familyLeaveBalance", label: "Family", color: "#10b981" },
                    ].map(({ key, label, color }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-medium" style={{ color }}>{label}</label>
                        <input
                          type="number"
                          min={0}
                          max={365}
                          value={form[key as keyof typeof form] as number}
                          onChange={(e) => setForm((p) => ({ ...p, [key]: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 rounded-xl border text-sm outline-none text-center"
                          style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              {canEditRole && employee.role !== "admin" && (
                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--background-subtle)" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Account Status</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {form.isActive ? "Active — employee can login" : "Deactivated — no access"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                    className="w-12 h-6 rounded-full transition-all relative"
                    style={{ background: form.isActive ? "#6366f1" : "var(--border)" }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                      style={{ left: form.isActive ? "26px" : "2px" }}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--background-subtle)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
