"use client";

import React, { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { toast } from "sonner";

interface ProfileSettingsProps {
  user: any;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  name: string;
  email: string;
}

export function ProfileSettings({ user, onNameChange, onEmailChange, name, email }: ProfileSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--primary)]" />
          <CardTitle>Profile Information</CardTitle>
        </div>
        <CardDescription>Update your personal details and profile picture</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-[var(--border)]">
          <AvatarUpload
            userId={user?.id ?? ""}
            currentUrl={user?.avatar}
            name={user?.name ?? "User"}
            size="lg"
            onSuccess={(url) => {
              toast.success("Avatar updated successfully!");
            }}
          />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Profile Picture</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Click the camera icon to upload a new avatar
            </p>
            <p className="text-xs text-[var(--text-muted)]">JPG, PNG or GIF. Max 5MB.</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                value={name} 
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email"
                value={email} 
                onChange={(e) => onEmailChange(e.target.value)} 
                type="email"
                placeholder="your.email@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role"
                value={user?.role || ""} 
                disabled 
                className="opacity-60 bg-[var(--surface-hover)]" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input 
                id="department"
                defaultValue={user?.department ?? "Not assigned"} 
                disabled
                className="opacity-60 bg-[var(--surface-hover)]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
