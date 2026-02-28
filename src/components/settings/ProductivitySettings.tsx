"use client";

import React, { useState, useEffect } from "react";
import { Zap, Clock, Bell, Target, Keyboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductivitySettingsProps {
  user: any;
  onSettingsChange: (settings: any) => void;
}

export function ProductivitySettings({ user, onSettingsChange }: ProductivitySettingsProps) {
  const [focusMode, setFocusMode] = useState(user?.focusModeEnabled ?? false);
  const [breakReminders, setBreakReminders] = useState(user?.breakRemindersEnabled ?? true);
  const [workHoursStart, setWorkHoursStart] = useState(user?.workHoursStart ?? "09:00");
  const [workHoursEnd, setWorkHoursEnd] = useState(user?.workHoursEnd ?? "18:00");
  const [breakInterval, setBreakInterval] = useState(String(user?.breakInterval ?? 120));
  const [dailyGoal, setDailyGoal] = useState(String(user?.dailyTaskGoal ?? 5));

  // Update parent when settings change
  useEffect(() => {
    const settings = {
      focusModeEnabled: focusMode,
      workHoursStart,
      workHoursEnd,
      breakRemindersEnabled: breakReminders,
      breakInterval: parseInt(breakInterval) || 120,
      dailyTaskGoal: parseInt(dailyGoal) || 5,
    };
    console.log('ProductivitySettings updating:', settings);
    onSettingsChange(settings);
  }, [focusMode, workHoursStart, workHoursEnd, breakReminders, breakInterval, dailyGoal, onSettingsChange]);

  // Sync when user data changes
  useEffect(() => {
    if (user) {
      setFocusMode(user.focusModeEnabled ?? false);
      setBreakReminders(user.breakRemindersEnabled ?? true);
      setWorkHoursStart(user.workHoursStart ?? "09:00");
      setWorkHoursEnd(user.workHoursEnd ?? "18:00");
      setBreakInterval(String(user.breakInterval ?? 120));
      setDailyGoal(String(user.dailyTaskGoal ?? 5));
    }
  }, [user?.focusModeEnabled, user?.breakRemindersEnabled, user?.workHoursStart, user?.workHoursEnd, user?.breakInterval, user?.dailyTaskGoal]);

  return (
    <div className="space-y-6">
      {/* Focus Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--warning)]" />
            <CardTitle>Focus Mode</CardTitle>
          </div>
          <CardDescription>Minimize distractions during work hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Enable Focus Mode</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Automatically mute non-critical notifications during work hours
                </p>
              </div>
            </div>
            <Switch checked={focusMode} onCheckedChange={setFocusMode} />
          </div>

          {focusMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5">
              <div className="space-y-2">
                <Label htmlFor="work-start">Work Hours Start</Label>
                <Input
                  id="work-start"
                  type="time"
                  value={workHoursStart}
                  onChange={(e) => setWorkHoursStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work-end">Work Hours End</Label>
                <Input
                  id="work-end"
                  type="time"
                  value={workHoursEnd}
                  onChange={(e) => setWorkHoursEnd(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Break Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>Break Reminders</CardTitle>
          </div>
          <CardDescription>Stay healthy with regular break notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">☕</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Break Notifications</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Get reminded to take breaks and stretch
                </p>
              </div>
            </div>
            <Switch checked={breakReminders} onCheckedChange={setBreakReminders} />
          </div>

          {breakReminders && (
            <div className="space-y-2 p-4 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5">
              <Label htmlFor="break-interval">Break Interval</Label>
              <Select value={breakInterval} onValueChange={setBreakInterval}>
                <SelectTrigger id="break-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">⚡ Every 1 minute (for testing)</SelectItem>
                  <SelectItem value="60">Every 60 minutes (1 hour)</SelectItem>
                  <SelectItem value="90">Every 90 minutes (1.5 hours)</SelectItem>
                  <SelectItem value="120">Every 2 hours (recommended)</SelectItem>
                  <SelectItem value="180">Every 3 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                {parseInt(breakInterval) === 1 
                  ? "⚡ Testing mode: Break reminder every 1 minute" 
                  : `You'll be reminded every ${parseInt(breakInterval)} minutes to take a short break`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--success)]" />
            <CardTitle>Daily Goals</CardTitle>
          </div>
          <CardDescription>Set productivity targets to stay motivated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily-tasks">Daily Task Goal</Label>
              <Input
                id="daily-tasks"
                type="number"
                min="1"
                max="20"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
              />
              <p className="text-xs text-[var(--text-muted)]">
                Number of tasks to complete per day
              </p>
            </div>
            <div className="flex items-center justify-center p-6 rounded-lg bg-gradient-to-br from-[var(--primary)]/10 to-[var(--success)]/10 border border-[var(--border)]">
              <div className="text-center">
                <p className="text-3xl font-bold text-[var(--primary)]">{dailyGoal}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">tasks/day</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>Keyboard Shortcuts</CardTitle>
          </div>
          <CardDescription>Speed up your workflow with quick actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { key: "⌘ K", action: "Command Palette", desc: "Quick search and actions" },
              { key: "⌘ T", action: "New Task", desc: "Create a new task instantly" },
              { key: "⌘ L", action: "Request Leave", desc: "Open leave request form" },
              { key: "⌘ A", action: "Attendance", desc: "Clock in/out" },
              { key: "⌘ /", action: "Toggle Sidebar", desc: "Show/hide navigation" },
              { key: "⌘ B", action: "Notifications", desc: "Open notification panel" },
            ].map((shortcut, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 text-xs font-semibold bg-[var(--surface-hover)] border border-[var(--border)] rounded">
                      {shortcut.key}
                    </kbd>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{shortcut.action}</p>
                      <p className="text-xs text-[var(--text-muted)]">{shortcut.desc}</p>
                    </div>
                  </div>
                </div>
                {idx < 5 && <div className="border-b border-[var(--border)] mt-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
