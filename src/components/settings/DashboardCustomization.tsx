"use client";

import React, { useState, useEffect } from "react";
import { LayoutDashboard, Eye, RefreshCw, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface DashboardCustomizationProps {
  user: any;
  onSettingsChange: (settings: any) => void;
}

export function DashboardCustomization({ user, onSettingsChange }: DashboardCustomizationProps) {
  const defaultWidgets = {
    quickStats: true,
    leaveCalendar: true,
    upcomingTasks: true,
    teamActivity: true,
    recentLeaves: false,
    analytics: true,
  };

  const [defaultView, setDefaultView] = useState(user?.defaultView ?? "dashboard");
  const [refreshRate, setRefreshRate] = useState(user?.dataRefreshRate ?? "realtime");
  const [compactMode, setCompactMode] = useState(user?.compactMode ?? false);
  
  const [widgets, setWidgets] = useState(user?.dashboardWidgets ?? defaultWidgets);

  // Update parent when settings change
  useEffect(() => {
    onSettingsChange({
      defaultView,
      dataRefreshRate: refreshRate,
      compactMode,
    });
  }, [defaultView, refreshRate, compactMode]);

  // Sync when user data changes
  useEffect(() => {
    if (user) {
      setDefaultView(user.defaultView ?? "dashboard");
      setRefreshRate(user.dataRefreshRate ?? "realtime");
      setCompactMode(user.compactMode ?? false);
      setWidgets(user.dashboardWidgets ?? defaultWidgets);
    }
  }, [user?.defaultView, user?.dataRefreshRate, user?.compactMode, user?.dashboardWidgets]);

  const toggleWidget = (key: keyof typeof widgets) => {
    setWidgets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Default View */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>Default Landing Page</CardTitle>
          </div>
          <CardDescription>Choose which page opens when you log in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-view">Landing Page</Label>
            <Select value={defaultView} onValueChange={setDefaultView}>
              <SelectTrigger id="default-view">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">📊 Dashboard</SelectItem>
                <SelectItem value="tasks">✓ Tasks</SelectItem>
                <SelectItem value="calendar">📅 Calendar</SelectItem>
                <SelectItem value="leaves">📋 Leaves</SelectItem>
                <SelectItem value="attendance">⏰ Attendance</SelectItem>
                <SelectItem value="analytics">📈 Analytics</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-[var(--text-muted)]">
              You'll be redirected to this page after login
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Widget Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>Dashboard Widgets</CardTitle>
          </div>
          <CardDescription>Customize which widgets appear on your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(widgets).map(([key, enabled]) => {
            const widgetLabels: Record<string, { name: string; desc: string; emoji: string }> = {
              quickStats: { name: "Quick Statistics", desc: "Overview of leaves, tasks, and attendance", emoji: "📊" },
              leaveCalendar: { name: "Leave Calendar", desc: "Visual calendar of team absences", emoji: "📅" },
              upcomingTasks: { name: "Upcoming Tasks", desc: "Your next tasks and deadlines", emoji: "✓" },
              teamActivity: { name: "Team Activity", desc: "Recent team actions and updates", emoji: "👥" },
              recentLeaves: { name: "Recent Leaves", desc: "Latest leave requests and approvals", emoji: "📋" },
              analytics: { name: "Analytics Chart", desc: "Performance trends and insights", emoji: "📈" },
            };

            const widget = widgetLabels[key];
            
            return (
              <div key={key}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{widget.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{widget.name}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{widget.desc}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={enabled} 
                    onCheckedChange={() => toggleWidget(key as keyof typeof widgets)} 
                  />
                </div>
                {key !== "analytics" && <div className="border-b border-[var(--border)] mt-3" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Display & Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>Display & Performance</CardTitle>
          </div>
          <CardDescription>Optimize your viewing experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📐</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Compact Mode</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Reduce spacing to show more content on screen
                </p>
              </div>
            </div>
            <Switch checked={compactMode} onCheckedChange={setCompactMode} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refresh-rate">Data Refresh Rate</Label>
            <Select value={refreshRate} onValueChange={setRefreshRate}>
              <SelectTrigger id="refresh-rate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">⚡ Real-time (instant updates)</SelectItem>
                <SelectItem value="5min">🔄 Every 5 minutes</SelectItem>
                <SelectItem value="15min">⏱️ Every 15 minutes</SelectItem>
                <SelectItem value="30min">⏰ Every 30 minutes</SelectItem>
                <SelectItem value="manual">🤚 Manual refresh only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-[var(--text-muted)]">
              {refreshRate === "realtime" 
                ? "Data updates instantly when changes occur" 
                : refreshRate === "manual"
                ? "Refresh data manually using the refresh button"
                : `Data refreshes automatically every ${refreshRate.replace("min", " minutes")}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
