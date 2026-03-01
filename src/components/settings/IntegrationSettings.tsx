"use client";

import React, { useState } from "react";
import { Link2, Calendar, Mail, MessageSquare, Download, Cloud } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export function IntegrationSettings() {
  const { t } = useTranslation();
  const [googleCalendarSync, setGoogleCalendarSync] = useState(false);
  const [emailReports, setEmailReports] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);

  const integrations = [
    {
      name: t("settingsIntegration.googleCalendar"),
      description: t("settingsIntegration.googleCalendarDesc"),
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      connected: googleCalendarSync,
      onToggle: setGoogleCalendarSync,
    },
    {
      name: t("settingsIntegration.outlookCalendar"),
      description: t("settingsIntegration.outlookCalendarDesc"),
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      connected: false,
      onToggle: () => {},
    },
    {
      name: t("settingsIntegration.slack"),
      description: t("settingsIntegration.slackDesc"),
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      connected: slackNotifications,
      onToggle: setSlackNotifications,
    },
    {
      name: t("settingsIntegration.microsoftTeams"),
      description: t("settingsIntegration.microsoftTeamsDesc"),
      icon: MessageSquare,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      connected: false,
      onToggle: () => {},
    },
  ];

  return (
    <div className="space-y-6">
      {/* Calendar Integrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>{t("settingsIntegration.title")}</CardTitle>
          </div>
          <CardDescription>{t("settingsIntegration.calendarSync")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {integrations.filter(i => i.icon === Calendar).map((integration) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.name}
                className="flex items-start justify-between p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg ${integration.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${integration.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{integration.name}</p>
                      {integration.connected && (
                        <Badge variant="default" className="text-xs">{t('settingsIntegration.connected')}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{integration.description}</p>
                  </div>
                </div>
                {integration.connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => integration.onToggle(false)}
                  >
                    {t('settingsIntegration.disconnect')}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => integration.onToggle(true)}
                  >
                    {t('settingsIntegration.connect')}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Email Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>{t("settingsIntegration.title")}</CardTitle>
          </div>
          <CardDescription>{t("settingsIntegration.emailReports")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{t('settingsIntegration.automatedReports')}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {t('settingsIntegration.automatedReportsDesc')}
                </p>
              </div>
            </div>
            <Switch checked={emailReports} onCheckedChange={setEmailReports} />
          </div>

          {emailReports && (
            <div className="p-4 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 space-y-2">
              <p className="text-sm font-medium text-[var(--text-primary)]">{t('settingsIntegration.reportSchedule')}</p>
              <div className="space-y-1 text-xs text-[var(--text-muted)]">
                <p>• {t('settingsIntegration.weeklySummary')}</p>
                <p>• {t('settingsIntegration.monthlyAnalytics')}</p>
                <p>• {t('settingsIntegration.leaveApprovals')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messaging Integrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>{t("settingsIntegration.title")}</CardTitle>
          </div>
          <CardDescription>{t("settingsIntegration.teamCommunication")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {integrations.filter(i => i.icon === MessageSquare).map((integration) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.name}
                className="flex items-start justify-between p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg ${integration.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${integration.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{integration.name}</p>
                      {integration.connected && (
                        <Badge variant="default" className="text-xs">{t('settingsIntegration.connected')}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{integration.description}</p>
                  </div>
                </div>
                {integration.connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => integration.onToggle(false)}
                  >
                    {t('settingsIntegration.disconnect')}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => integration.onToggle(true)}
                  >
                    {t('settingsIntegration.connect')}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Export & Backup */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>{t("settingsIntegration.title")}</CardTitle>
          </div>
          <CardDescription>{t("settingsIntegration.dataManagement")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              {t("settingsIntegration.exportAsCSV")}
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              {t("settingsIntegration.exportAsExcel")}
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              {t("settingsIntegration.exportAsPDFReport")}
            </Button>
            <Button variant="outline" className="justify-start">
              <Cloud className="w-4 h-4 mr-2" />
              {t("settingsIntegration.backupToCloud")}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]">
            <div className="flex items-start gap-3">
              <span className="text-xl">💾</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{t("settingsIntegration.lastBackup")}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {t("settingsIntegration.neverBackedUp")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
