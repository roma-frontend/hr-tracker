"use client";

import React, { useState } from "react";
import { Shield, Smartphone, History, Key, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export function AdvancedSecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Mock data for sessions and login history
  const activeSessions = [
    { id: 1, device: "Chrome on Windows", location: "Moscow, Russia", ip: "192.168.1.1", lastActive: "Just now", current: true },
    { id: 2, device: "Safari on iPhone", location: "Moscow, Russia", ip: "192.168.1.25", lastActive: "2 hours ago", current: false },
  ];

  const loginHistory = [
    { id: 1, date: "2024-02-28 09:15", device: "Chrome on Windows", location: "Moscow, Russia", ip: "192.168.1.1", status: "success" },
    { id: 2, date: "2024-02-27 18:30", device: "Safari on iPhone", location: "Moscow, Russia", ip: "192.168.1.25", status: "success" },
    { id: 3, date: "2024-02-27 09:00", device: "Chrome on Windows", location: "Moscow, Russia", ip: "192.168.1.1", status: "success" },
    { id: 4, date: "2024-02-26 17:45", device: "Firefox on MacOS", location: "Unknown", ip: "203.0.113.0", status: "failed" },
  ];

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔐</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Enable 2FA</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Require a verification code in addition to your password
                </p>
              </div>
            </div>
            <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
          </div>

          {twoFactorEnabled && (
            <div className="p-4 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 space-y-3">
              <p className="text-sm font-medium text-[var(--text-primary)]">Choose 2FA Method:</p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  📱 SMS Text Message
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📧 Email Code
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🔑 Authenticator App (Google, Microsoft)
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[var(--primary)]" />
                <CardTitle>Active Sessions</CardTitle>
              </div>
              <CardDescription>Manage devices currently logged into your account</CardDescription>
            </div>
            <Badge variant="secondary">{activeSessions.length} active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-start justify-between p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{session.device}</p>
                    {session.current && (
                      <Badge variant="default" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {session.location} • {session.ip}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Last active: {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                  Sign Out
                </Button>
              )}
            </div>
          ))}

          <Button variant="outline" className="w-full" size="sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Sign Out All Other Sessions
          </Button>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--primary)]" />
            <CardTitle>Login History</CardTitle>
          </div>
          <CardDescription>Recent login attempts and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loginHistory.map((login, idx) => (
              <div key={login.id}>
                <div className="flex items-start justify-between py-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      login.status === "success" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {login.device}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {login.location} • {login.ip}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {login.date}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={login.status === "success" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {login.status === "success" ? "✓ Success" : "✗ Failed"}
                  </Badge>
                </div>
                {idx < loginHistory.length - 1 && (
                  <div className="border-b border-[var(--border)]" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--warning)]" />
            <CardTitle>Security Alerts</CardTitle>
          </div>
          <CardDescription>Get notified of suspicious activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Login Alerts</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Get notified when someone logs into your account
                </p>
              </div>
            </div>
            <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} />
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Security Tip</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Use a strong, unique password and enable 2FA for maximum security. 
                  Regularly review your login history for any suspicious activity.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
