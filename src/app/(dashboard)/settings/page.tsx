"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Bell, Shield, Palette, Globe, ScanFace } from "lucide-react";
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
import { FaceRegistration } from "@/components/auth/FaceRegistration";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import dynamic from "next/dynamic";

const SLASettings = dynamic(() => import("@/components/admin/SLASettings"), { ssr: false });

export default function SettingsPage() {
  const { user, login } = useAuthStore();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  // Get face descriptor status
  const faceData = useQuery(
    api.faceRecognition.getFaceDescriptor,
    user?.id ? { userId: user.id as any } : "skip"
  );
  const removeFaceRegistration = useMutation(api.faceRecognition.removeFaceRegistration);
  const updateUser = useMutation(api.users.updateUser);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateUser({
        userId: user.id as any,
        name: name.trim() || user.name,
        email: email.trim() || user.email,
      });
      // Update local store
      login({ ...user, name: name.trim() || user.name, email: email.trim() || user.email });
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
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
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
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

      {/* Security - WebAuthn */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--primary)]" />
            <CardTitle className="text-base">Touch ID / Fingerprint</CardTitle>
          </div>
          <CardDescription>Register Touch ID or fingerprint for quick login</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-muted)]">
              Enable Touch ID or fingerprint for faster and more secure login
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

      {/* Face ID Registration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ScanFace className="w-4 h-4 text-[var(--primary)]" />
            <CardTitle className="text-base">Face ID</CardTitle>
          </div>
          <CardDescription>Register your face for secure login</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faceData?.faceDescriptor ? (
              <>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--surface-hover)]">
                    {faceData.faceImageUrl && (
                      <img
                        src={faceData.faceImageUrl}
                        alt="Registered face"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      ✓ Face ID Registered
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Registered on {new Date(faceData.faceRegisteredAt || 0).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (confirm("Are you sure you want to remove Face ID registration?")) {
                      await removeFaceRegistration({ userId: user?.id as any });
                      toast.success("Face ID removed successfully");
                    }
                  }}
                  className="w-full"
                >
                  Remove Face ID
                </Button>
              </>
            ) : (
              <>
                {!showFaceRegistration ? (
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--text-muted)]">
                      Register your face to enable quick and secure login with Face ID
                    </p>
                    <Button
                      onClick={() => setShowFaceRegistration(true)}
                      className="w-full"
                    >
                      <ScanFace className="w-4 h-4 mr-2" />
                      Register Face ID
                    </Button>
                  </div>
                ) : (
                  <FaceRegistration
                    userId={user?.id as any}
                    onSuccess={() => {
                      setShowFaceRegistration(false);
                      toast.success("Face ID registered successfully!");
                    }}
                    onCancel={() => setShowFaceRegistration(false)}
                  />
                )}
              </>
            )}
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

      {/* Admin-Only: SLA Settings */}
      {user?.role === "admin" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SLASettings />
        </motion.div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </motion.div>
  );
}
