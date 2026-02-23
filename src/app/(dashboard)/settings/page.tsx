"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Bell, Shield, Palette, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { WebAuthnButton } from "@/components/auth/WebAuthnButton";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    toast.success("Settings saved successfully");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl"
    >
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">Manage your account and system preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--primary)]" />
            <CardTitle className="text-base">Profile Information</CardTitle>
          </div>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
            <AvatarUpload
              userId={user?.id ?? ""}
              currentUrl={user?.avatar}
              name={user?.name ?? "User"}
              size="lg"
              onSuccess={(url) => {
                toast.success("Avatar updated!");
              }}
            />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Profile Picture</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Click the camera icon to upload a new avatar
              </p>
              <p className="text-xs text-[var(--text-muted)]">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input defaultValue={user?.name} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input defaultValue={user?.email} type="email" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input defaultValue={user?.role} disabled className="opacity-60" />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input defaultValue={user?.department ?? ""} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[var(--warning)]" />
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
          <CardDescription>Configure how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Email Notifications", desc: "Receive leave updates via email", value: emailNotifs, set: setEmailNotifs },
            { label: "Push Notifications", desc: "Browser push notifications", value: pushNotifs, set: setPushNotifs },
            { label: "Weekly Report", desc: "Get weekly summary digest", value: weeklyReport, set: setWeeklyReport },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
              </div>
              <Switch checked={item.value} onCheckedChange={item.set} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security - Face ID */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--primary)]" />
            <CardTitle className="text-base">Security & Authentication</CardTitle>
          </div>
          <CardDescription>Manage biometric authentication for quick login</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-muted)]">
              Enable Face ID or Touch ID for faster and more secure login
            </p>
            <WebAuthnButton
              mode="register"
              userId={user?.id}
              onSuccess={() => {
                toast.success("Biometric authentication registered successfully!");
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--primary)]" />
            <CardTitle className="text-base">Appearance</CardTitle>
          </div>
          <CardDescription>Customize your interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {["Dark", "Light", "System"].map((t) => (
              <button
                key={t}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  t === "Dark"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--text-primary)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-subtle)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </motion.div>
  );
}
