"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Building2,
  UserCog,
  Eye,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { AnimatePresence } from "framer-motion";

interface Employee {
  _id: string;
  name: string;
  email: string;
  position?: string;
  department?: string;
  role: string;
  employeeType: "staff" | "contractor";
  avatarUrl?: string;
  phone?: string;
  supervisorId?: string;
  isActive: boolean;
  presenceStatus?: string;
  travelAllowance?: number;
}

interface RoleConfig {
  labelKey: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

interface TypeConfig {
  labelKey: string;
  color: string;
  bg: string;
}

interface EmployeeCardProps {
  emp: Employee;
  roleConf: RoleConfig;
  typeConf: TypeConfig;
  presence: { labelKey: string; cls: string };
  supervisors?: Array<{ _id: string; name: string }>;
  canManage: boolean;
  isAdmin: boolean;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  setEditEmployee: (emp: Employee) => void;
  setDeleteConfirm: (id: string) => void;
  t: (key: string) => string;
  viewMode: "grid" | "list";
  index: number;
}

/**
 * Оптимизированный компонент карточки сотрудника
 * Использует React.memo для предотвращения лишних ре-рендеров
 */
export const EmployeeCard = React.memo<EmployeeCardProps>(
  ({
    emp,
    roleConf,
    typeConf,
    presence,
    supervisors,
    canManage,
    isAdmin,
    openMenuId,
    setOpenMenuId,
    setEditEmployee,
    setDeleteConfirm,
    t,
    viewMode,
    index,
  }) => {
    const router = useRouter();
    const RoleIcon = roleConf.icon;

    const supervisor = supervisors?.find((s) => s._id === emp.supervisorId);

    // Grid view
    if (viewMode === "grid") {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ delay: index * 0.03 }}
          onClick={() => router.push(`/employees/${emp._id}`)}
          className="relative p-5 rounded-2xl border group cursor-pointer hover:shadow-lg transition-shadow"
          style={{
            background: "var(--card)",
            borderColor: emp.isActive ? "var(--border)" : "rgba(239,68,68,0.2)",
            opacity: emp.isActive ? 1 : 0.6,
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <AvatarUpload
              userId={emp._id}
              currentUrl={emp.avatarUrl}
              name={emp.name}
              size="md"
              readonly={!canManage && emp._id !== (window as any).__CURRENT_USER_ID__}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate cursor-pointer hover:text-blue-500 transition-colors" style={{ color: "var(--text-primary)" }}>
                {emp.name}
              </h3>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                {emp.position ?? "No position"}
              </p>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1"
                style={{ background: roleConf.bg, color: roleConf.color }}
              >
                <RoleIcon className="w-2.5 h-2.5" />
                {t(roleConf.labelKey)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{emp.email}</span>
            </div>
            {emp.phone && (
              <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <Phone className="w-3 h-3" />
                {emp.phone}
              </div>
            )}
            {emp.department && (
              <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <Building2 className="w-3 h-3" />
                {emp.department}
              </div>
            )}
            {emp.supervisorId && (
              <div className="flex items-center gap-2">
                <UserCog className="w-3 h-3 flex-shrink-0 text-blue-400" />
                <span className="truncate text-blue-500 font-medium">
                  {supervisor?.name ?? "Supervisor"}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: typeConf.bg, color: typeConf.color }}
              >
                {t(typeConf.labelKey)}
              </span>
              {emp.supervisorId && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-500">
                  {supervisor?.name ?? "Supervisor"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {isAdmin ? (
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  {emp.travelAllowance?.toLocaleString() ?? "0"} AMD
                </span>
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${presence.cls}`}>
                  {t(presence.labelKey)}
                </span>
              )}
            </div>
          </div>

          {!emp.isActive && (
            <div
              className="absolute inset-0 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.05)" }}
            >
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
              >
                {t("employees.deactivatedBadge")}
              </span>
            </div>
          )}
        </motion.div>
      );
    }

    // List view
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ delay: index * 0.02 }}
        onClick={() => router.push(`/employees/${emp._id}`)}
        className="flex flex-col gap-3 p-4 sm:grid sm:grid-cols-12 sm:gap-4 sm:px-5 sm:py-3.5 sm:items-center group cursor-pointer border-t transition-colors hover:bg-[var(--background-subtle)] relative"
        style={{ borderColor: "var(--border)", opacity: emp.isActive ? 1 : 0.5 }}
      >
        {/* Employee name + avatar */}
        <div className="sm:col-span-4 flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold">
            {emp.avatarUrl ? (
              <img
                src={emp.avatarUrl}
                alt={emp.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              emp.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
              {emp.name}
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-0.5 text-xs font-medium"
                style={{ color: roleConf.color }}
              >
                <RoleIcon className="w-2.5 h-2.5" />
                {emp.position ?? t(roleConf.labelKey)}
              </span>
            </div>
          </div>
          {/* Mobile-only action chevron */}
          <ChevronRight
            className="w-4 h-4 sm:hidden flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
          />
        </div>

        {/* Mobile info row */}
        <div className="flex flex-wrap items-center gap-2 sm:hidden">
          {emp.department && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--background-subtle)", color: "var(--text-muted)" }}
            >
              <Building2 className="w-3 h-3 inline mr-1" />
              {emp.department}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${presence.cls}`}>
            {t(presence.labelKey)}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: typeConf.bg, color: typeConf.color }}
          >
            {t(typeConf.labelKey)}
          </span>
        </div>

        {/* Department - desktop only */}
        <div className="hidden sm:block sm:col-span-2 text-sm truncate" style={{ color: "var(--text-muted)" }}>
          {emp.department ?? "—"}
        </div>

        {/* Supervisor - desktop only */}
        <div className="hidden sm:block sm:col-span-2 text-sm truncate text-blue-500 font-medium">
          {emp.supervisorId ? supervisor?.name ?? "—" : "—"}
        </div>

        {/* Presence status - desktop only */}
        <div className="hidden sm:block sm:col-span-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${presence.cls}`}>
            {t(presence.labelKey)}
          </span>
        </div>

        {/* Type - desktop only */}
        <div className="hidden sm:block sm:col-span-2" style={{ textAlign: "center" }}>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: typeConf.bg, color: typeConf.color }}
          >
            {t(typeConf.labelKey)}
          </span>
        </div>

        {/* Actions — view only on hover */}
        <div
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md border"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/employees/${emp._id}`);
            }}
            className="p-1.5 rounded-md text-blue-500 hover:bg-blue-500/20 transition-colors"
            title={t("common.view")}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    );
  }
);

EmployeeCard.displayName = "EmployeeCard";

/**
 * Оптимизированный компонент меню действий
 */
export const EmployeeMenu = React.memo<{
  emp: Employee;
  isOpen: boolean;
  onClose: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: string) => string;
}>(function EmployeeMenu({ emp, isOpen, onClose, onView, onEdit, onDelete, t }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="relative flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          style={{ color: "var(--text-muted)", background: "var(--background-subtle)" }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-8 w-40 rounded-xl border shadow-xl z-20 overflow-hidden"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:opacity-80"
                style={{ color: "var(--text-primary)" }}
              >
                <Eye className="w-3.5 h-3.5" /> {t("common.viewProfile")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:opacity-80"
                style={{ color: "var(--text-primary)" }}
              >
                <Edit2 className="w-3.5 h-3.5" /> {t("common.edit")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:opacity-80"
                style={{ color: "#ef4444" }}
              >
                <Trash2 className="w-3.5 h-3.5" /> {t("employees.deactivate")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});
