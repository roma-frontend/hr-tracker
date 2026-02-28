"use client";

import React, { useState } from "react";
import { Link2, Calendar, Mail, MessageSquare, Download, Cloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export function IntegrationSettings() {
  const [googleCalendarSync, setGoogleCalendarSync] = useState(false);
  const [emailReports, setEmailReports] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);

  const integrations = [
    {
      name: "Google Calendar",
      description: "Sync your leave requests and events with Google Calendar",
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      connected: googleCalendarSync,
      onToggle: setGoogleCalendarSync,
    },
    {
      name: "Outlook Calendar",
      description: "Integrate with Microsoft Outlook for calendar sync",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      connected: false,
      onToggle: () => {},
    },
    {
      name: "Slack",
      description: "Receive notifications in your Slack workspace",
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      connected: slackNotifications,
      onToggle: setSlackNotifications,
    },
    {
      name: "Microsoft Teams",
      description: "Get alerts and updates in Microsoft Teams",
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
            <CardTitle>Calendar Sync</CardTitle>
          </div>
          <CardDescription>Synchronize your leave calendar with external services</CardDescription>
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
                        <Badge variant="default" className="text-xs">Connected</Badge>
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
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => integration.onToggle(true)}
                  >
                    Connect
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
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>Configure automatic email reports and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Automated Reports</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Send weekly summary reports to your email every Monday
                </p>
              </div>
            </div>
            <Switch checked={emailReports} onCheckedChange={setEmailReports} />
          </div>

          {emailReports && (
            <div className="p-4 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 space-y-2">
              <p className="text-sm font-medium text-[var(--text-primary)]">Report Schedule:</p>
              <div className="space-y-1 text-xs text-[var(--text-muted)]">
                <p>• Weekly Summary: Every Monday at 9:00 AM</p>
                <p>• Monthly Analytics: 1st of each month</p>
                <p>• Leave Approvals: Instant notifications</p>
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
            <CardTitle>Messaging Apps</CardTitle>
          </div>
          <CardDescription>Connect with your team communication tools</CardDescription>
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
                        <Badge variant="default" className="text-xs">Connected</Badge>
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
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => integration.onToggle(true)}
                  >
                    Connect
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
            <CardTitle>Data Export</CardTitle>
          </div>
          <CardDescription>Export your data for backup or analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export as Excel
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export as PDF Report
            </Button>
            <Button variant="outline" className="justify-start">
              <Cloud className="w-4 h-4 mr-2" />
              Backup to Cloud
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]">
            <div className="flex items-start gap-3">
              <span className="text-xl">💾</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Last Backup</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Never backed up. We recommend backing up your data regularly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
