"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Building2,
  UserCheck,
  BarChart3,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "supervisor", "employee"] },
  { href: "/attendance", label: "Attendance", icon: Clock, roles: ["admin", "supervisor", "employee"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin", "supervisor"] },
  { href: "/leaves", label: "Leaves", icon: ClipboardList, roles: ["admin", "supervisor", "employee"] },
  { href: "/employees", label: "Employees", icon: Users, roles: ["admin", "supervisor"] },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, roles: ["admin", "supervisor", "employee"] },
  { href: "/reports", label: "Reports", icon: FileText, roles: ["admin", "supervisor"] },
  { href: "/approvals", label: "Approvals", icon: UserCheck, roles: ["admin"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["admin", "supervisor", "employee"] },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle, setMobileOpen } = useSidebarStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="relative hidden lg:flex flex-col h-screen border-r z-30 flex-shrink-0 transition-colors duration-300"
        style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}
      >
        {/* Logo + Toggle */}
        <div
          className="flex items-center h-16 px-3 flex-shrink-0 border-b transition-colors duration-300 justify-between gap-2"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          {/* Logo — hidden when collapsed */}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm leading-tight truncate text-[var(--text-primary)]">HR Office</p>
                  <p className="text-[10px] truncate text-[var(--text-muted)]">Leave Monitoring</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse toggle — always visible, ml-auto when collapsed */}
          <button
            onClick={toggle}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 border",
              collapsed && "ml-auto mr-auto"
            )}
            style={{
              background: "var(--sidebar-item-active)",
              borderColor: "color-mix(in srgb, var(--primary) 30%, transparent)",
              color: "var(--primary)",
            }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.filter(item => item.roles.includes(user?.role || "employee")).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "border"
                    : "hover:text-[var(--text-primary)]"
                )}
                style={
                  isActive
                    ? {
                        background: "var(--sidebar-item-active)",
                        color: "var(--sidebar-item-active-text)",
                        borderColor: "color-mix(in srgb, var(--primary) 20%, transparent)",
                      }
                    : {
                        color: "var(--text-muted)",
                        background: "transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "var(--sidebar-item-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--primary)] rounded-full"
                  />
                )}
                <Icon
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: isActive ? "var(--sidebar-item-active-text)" : "var(--text-disabled)" }}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-[var(--card)] text-[var(--text-primary)] border-[var(--border)]">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        {/* User info */}
        <div
          className="border-t p-3 flex-shrink-0 transition-colors duration-300"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar className="w-8 h-8 flex-shrink-0">
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback className="text-xs bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white font-bold">
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="min-w-0 flex-1"
                >
                  <p className="text-xs font-medium truncate text-[var(--text-primary)]">
                    {user?.name ?? "User"}
                  </p>
                  <p className="text-[10px] truncate capitalize text-[var(--text-muted)]">
                    {user?.role ?? "admin"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse toggle */}
      </motion.aside>
    </TooltipProvider>
  );
}

// ─── Mobile Sidebar ────────────────────────────────────────────────────────────
export function MobileSidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen } = useSidebarStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col lg:hidden border-r transition-colors duration-300"
            style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}
          >
            {/* Logo */}
            <div
              className="flex items-center h-16 px-4 border-b transition-colors duration-300"
              style={{ borderColor: "var(--sidebar-border)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-md">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight text-[var(--text-primary)]">HR Office</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Leave Monitoring</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
              {navItems.filter(item => item.roles.includes(user?.role || "employee")).map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive ? "border" : ""
                    )}
                    style={
                      isActive
                        ? {
                            background: "var(--sidebar-item-active)",
                            color: "var(--sidebar-item-active-text)",
                            borderColor: "color-mix(in srgb, var(--primary) 20%, transparent)",
                          }
                        : { color: "var(--text-muted)" }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "var(--sidebar-item-hover)";
                        (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                      }
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: isActive ? "var(--sidebar-item-active-text)" : "var(--text-disabled)" }}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User */}
            <div
              className="border-t p-3"
              style={{ borderColor: "var(--sidebar-border)" }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                  <AvatarFallback className="text-xs bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white font-bold">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate text-[var(--text-primary)]">
                    {user?.name ?? "User"}
                  </p>
                  <p className="text-[10px] truncate capitalize text-[var(--text-muted)]">
                    {user?.role ?? "admin"}
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
