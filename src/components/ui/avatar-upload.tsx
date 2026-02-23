"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, X, User } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { uploadAvatarToCloudinary } from "@/actions/cloudinary";
import { updateSessionAvatarAction } from "@/actions/auth";
import { toast } from "sonner";
import Image from "next/image";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuthStore } from "@/store/useAuthStore";

interface AvatarUploadProps {
  userId: string;
  currentUrl?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  onSuccess?: (url: string) => void;
  readonly?: boolean;
}

const sizes = {
  sm: "w-10 h-10 text-sm",
  md: "w-16 h-16 text-lg",
  lg: "w-24 h-24 text-2xl",
};

export function AvatarUpload({
  userId,
  currentUrl,
  name,
  size = "md",
  onSuccess,
  readonly = false,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const updateAvatar = useMutation(api.users.updateAvatar);
  const { user, setUser } = useAuthStore();

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const displayUrl = preview ?? currentUrl;

  const handleFile = async (file: File) => {
    console.log("📷 Avatar upload started");
    console.log("📁 File:", file.name, file.type, file.size);
    
    if (!file.type.startsWith("image/")) {
      console.error("❌ Invalid file type:", file.type);
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      console.error("❌ File too large:", file.size);
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setUploading(true);
    try {
      console.log("🔄 Converting to base64...");
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log("✅ Base64 converted, length:", base64.length);
      setPreview(base64);

      console.log("☁️ Uploading to Cloudinary...");
      console.log("👤 User ID:", userId);
      
      // Upload to Cloudinary
      const url = await uploadAvatarToCloudinary(base64, userId);

      console.log("✅ Cloudinary upload complete!");
      console.log("🔗 URL:", url);

      console.log("💾 Saving to Convex...");
      // Save URL to Convex
      await updateAvatar({
        userId: userId as Id<"users">,
        avatarUrl: url,
      });

      console.log("✅ Saved to Convex!");

      console.log("🔄 Updating session cookie...");
      // Update JWT cookie with new avatar
      await updateSessionAvatarAction(userId, url);
      console.log("✅ Session cookie updated!");

      setPreview(null);
      
      // Update user in store
      if (user && user.id === userId) {
        console.log("🔄 Updating user in store...");
        setUser({ ...user, avatar: url });
      }
      
      onSuccess?.(url);
      toast.success("Avatar updated successfully!");
      console.log("🎉 All done!");
    } catch (err) {
      console.error("❌ Upload error:", err);
      console.error("Error details:", err instanceof Error ? err.message : err);
      setPreview(null);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <div
        className={`${sizes[size]} rounded-full relative overflow-hidden flex-shrink-0`}
        style={{ background: "var(--primary-muted)" }}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className={`${sizes[size]} rounded-full flex items-center justify-center font-bold`}
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}
          >
            {initials || <User className="w-1/2 h-1/2" />}
          </div>
        )}

        {/* Uploading overlay */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center rounded-full"
              style={{ background: "rgba(0,0,0,0.6)" }}
            >
              <Loader2 className="w-1/3 h-1/3 text-white animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload button */}
      {!readonly && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 transition-all hover:scale-110 disabled:opacity-50"
            style={{
              background: "var(--primary)",
              borderColor: "var(--background)",
              color: "#fff",
            }}
            title="Change avatar"
          >
            <Camera className="w-3 h-3" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </>
      )}
    </div>
  );
}
