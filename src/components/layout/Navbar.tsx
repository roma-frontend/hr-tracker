"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, Bell, Sun, Moon, LogOut, User, Settings, ChevronDown, Check, X,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useAuthStore } from "@/store/useAuthStore";
import { logoutAction } from "@/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Id } from "../../../convex/_generated/dataModel";

// Play a beautiful notification sound using Web Audio API
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (freq: number, startTime: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Beautiful 3-note chime: C5 → E5 → G5
    playTone(523.25, now, 0.4, 0.3);
    playTone(659.25, now + 0.15, 0.4, 0.25);
    playTone(783.99, now + 0.3, 0.6, 0.2);
  } catch (e) {
    // Silently fail if audio not supported
  }
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leaves": "Leave Management",
  "/employees": "Employees",
  "/calendar": "Calendar",
  "/reports": "Reports",
  "/settings": "Settings",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

interface ToastNotif {
  id: string;
  title: string;
  message: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { setMobileOpen } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<ToastNotif[]>([]);
  const prevUnreadCount = useRef<number>(-1);
  const prevNotifIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  React.useEffect(() => { 
    setMounted(true); 
  }, []);

  // Convex notifications
  const notifications = useQuery(api.notifications.getUserNotifications, 
    user?.id ? { userId: user.id as Id<"users"> } : "skip"
  ) ?? [];
  const markRead = useMutation(api.notifications.markAsRead);
  const markAllRead = useMutation(api.notifications.markAllAsRead);

  const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length;

  // Detect new notifications and play sound + show toast
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    // Skip very first load to avoid sound on page refresh
    if (isFirstLoad.current) {
      notifications.forEach((n: any) => prevNotifIds.current.add(n._id));
      prevUnreadCount.current = unreadCount;
      isFirstLoad.current = false;
      return;
    }

    // Find truly new notifications (not seen before)
    const newNotifs = notifications.filter(
      (n: any) => !n.isRead && !prevNotifIds.current.has(n._id)
    );

    if (newNotifs.length > 0) {
      playNotificationSound();

      // Show toast for each new notification
      newNotifs.forEach((n: any) => {
        const toastId = n._id + Date.now();
        setToasts(prev => [...prev, { id: toastId, title: n.title, message: n.message }]);
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 5000);
      });

      // Update seen IDs
      newNotifs.forEach((n: any) => prevNotifIds.current.add(n._id));
    }

    // Also track all IDs
    notifications.forEach((n: any) => prevNotifIds.current.add(n._id));
    prevUnreadCount.current = unreadCount;
  }, [notifications, unreadCount]);

  const pageTitle = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] ?? "HR Office";

  const handleLogout = async () => {
    await logoutAction();
    logout();
    document.cookie = "hr-auth-token=; path=/; max-age=0";
    router.push("/");
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    await markAllRead({ userId: user.id as Id<"users"> });
  };

  const handleMarkRead = async (id: Id<"notifications">) => {
    await markRead({ notificationId: id });
  };

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  return (
    <>
    <header className="h-16 border-b border-[var(--border)] bg-[var(--navbar-bg)] backdrop-blur-md flex items-center px-4 gap-4 sticky top-0 z-20 transition-colors duration-300">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">{pageTitle}</h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#6366f1] rounded-full animate-pulse" />
            )}
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-20 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Notifications
                    </p>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <Badge variant="default" className="text-xs px-1.5 py-0 bg-[#6366f1]">
                          {unreadCount}
                        </Badge>
                      )}
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-[#6366f1] hover:underline flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> All read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <Bell className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
                        <p className="text-sm text-[var(--text-muted)]">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((n: { _id: Id<"notifications">; title: string; message: string; isRead: boolean; type: string; relatedId?: string; _creationTime: number }) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            handleMarkRead(n._id);
                            // Navigate based on notification type
                            if (n.type === "leave_request" && n.relatedId) {
                              router.push("/leaves");
                            } else if (n.type === "employee_added") {
                              router.push("/employees");
                            }
                            setShowNotifications(false);
                          }}
                          className={`px-4 py-3 hover:bg-[var(--background-subtle)] cursor-pointer transition-colors ${
                            !n.isRead ? "bg-[#6366f1]/5 border-l-2 border-[#6366f1]" : ""
                          }`}
                        >
                          <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{n.title}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">{n.message}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">{timeAgo(n._creationTime)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
        >
          {mounted ? (
            theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[var(--background-subtle)] transition-colors outline-none">
              <Avatar className="w-8 h-8">
                {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback className="text-xs bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white font-semibold">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">{user?.name ?? "User"}</p>
                <p className="text-[10px] text-[var(--text-muted)] capitalize">{user?.role ?? "admin"}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)] hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-[var(--card)] border-[var(--border)] shadow-xl"
          >
            <DropdownMenuLabel className="text-[var(--text-muted)] text-xs">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[var(--border)]" />
            <DropdownMenuItem
              className="text-[var(--text-primary)] cursor-pointer hover:bg-[var(--background-subtle)] focus:bg-[var(--background-subtle)] gap-2"
              onClick={() => router.push("/settings")}
            >
              <User className="w-4 h-4 text-[var(--text-muted)]" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-[var(--text-primary)] cursor-pointer hover:bg-[var(--background-subtle)] focus:bg-[var(--background-subtle)] gap-2"
              onClick={() => router.push("/settings")}
            >
              <Settings className="w-4 h-4 text-[var(--text-muted)]" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--border)]" />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    {/* Notification Toasts */}
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto w-80 bg-[var(--card)] border border-[#6366f1]/40 rounded-2xl shadow-2xl shadow-[#6366f1]/20 overflow-hidden"
          >
            {/* Animated top bar */}
            <div className="h-1 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]">
              <motion.div
                className="h-full bg-white/30"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </div>
            <div className="p-4 flex items-start gap-3">
              {/* Bell icon with pulse */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--card)] animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                  {toast.title}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-snug">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
    </>
  );
}
