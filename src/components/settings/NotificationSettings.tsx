"use client";

import React from "react";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface NotificationSettingsProps {
  emailNotifs: boolean;
  pushNotifs: boolean;
  weeklyReport: boolean;
  onEmailNotifsChange: (value: boolean) => void;
  onPushNotifsChange: (value: boolean) => void;
  onWeeklyReportChange: (value: boolean) => void;
}

export function NotificationSettings({
  emailNotifs,
  pushNotifs,
  weeklyReport,
  onEmailNotifsChange,
  onPushNotifsChange,
  onWeeklyReportChange,
}: NotificationSettingsProps) {
  const notifications = [
    {
      label: "Email Notifications",
      desc: "Receive leave updates and system alerts via email",
      value: emailNotifs,
      onChange: onEmailNotifsChange,
      icon: "📧",
    },
    {
      label: "Push Notifications",
      desc: "Get real-time browser push notifications",
      value: pushNotifs,
      onChange: onPushNotifsChange,
      icon: "🔔",
    },
    {
      label: "Weekly Report",
      desc: "Receive a weekly summary digest every Monday",
      value: weeklyReport,
      onChange: onWeeklyReportChange,
      icon: "📊",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[var(--warning)]" />
          <CardTitle>Notifications</CardTitle>
        </div>
        <CardDescription>Configure how you receive alerts and updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((item, idx) => (
          <div key={item.label}>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.desc}</p>
                </div>
              </div>
              <Switch checked={item.value} onCheckedChange={item.onChange} />
            </div>
            {idx < notifications.length - 1 && (
              <div className="border-b border-[var(--border)] mt-3" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
