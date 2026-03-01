"use client";

import React from "react";
import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const notifications = [
    {
      label: t("settingsNotifications.emailNotifications"),
      desc: t("settingsNotifications.emailNotificationsDesc"),
      value: emailNotifs,
      onChange: onEmailNotifsChange,
      icon: "📧",
    },
    {
      label: t("settingsNotifications.pushNotifications"),
      desc: t("settingsNotifications.pushNotificationsDesc"),
      value: pushNotifs,
      onChange: onPushNotifsChange,
      icon: "🔔",
    },
    {
      label: t("settingsNotifications.weeklyReport"),
      desc: t("settingsNotifications.weeklyReportDesc"),
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
          <CardTitle>{t("settingsNotifications.title")}</CardTitle>
        </div>
        <CardDescription>{t("settingsNotifications.description")}</CardDescription>
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
