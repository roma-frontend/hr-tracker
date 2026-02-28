"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { Id } from "../../../convex/_generated/dataModel";
import { Focus, Bell, BellOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FocusModeProps {
  currentPresence: string;
  onFocusChange?: (isFocus: boolean) => void;
}

export function FocusMode({ currentPresence, onFocusChange }: FocusModeProps) {
  const { user } = useAuthStore();
  const [isFocusMode, setIsFocusMode] = useState(currentPresence === "busy");
  const updatePresence = useMutation(api.users.updatePresenceStatus);

  const toggleFocusMode = async () => {
    if (!user?.id) return;

    try {
      const newFocusState = !isFocusMode;
      
      // Update presence status
      await updatePresence({
        userId: user.id as Id<"users">,
        status: newFocusState ? "busy" : "available",
      });

      setIsFocusMode(newFocusState);
      onFocusChange?.(newFocusState);

      if (newFocusState) {
        toast.success("Focus Mode activated! 🎯", {
          description: "Status set to Busy. Notifications muted.",
        });
      } else {
        toast.info("Focus Mode deactivated", {
          description: "Back to normal mode",
        });
      }
    } catch (error) {
      toast.error("Failed to toggle focus mode");
    }
  };

  return (
    <div className="px-2 py-3">
      <div className="mb-3 px-2">
        <h3 className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-2">
          <Focus className="w-3.5 h-3.5" />
          Focus Mode
        </h3>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
          Minimize distractions and stay productive
        </p>
      </div>

      {/* Focus Mode Toggle */}
      <div
        className={`rounded-xl border p-4 transition-all ${
          isFocusMode
            ? "border-[var(--primary)]/50 bg-[var(--primary)]/5"
            : "border-[var(--border)] bg-[var(--background-subtle)]"
        }`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
              isFocusMode
                ? "bg-[var(--primary)] shadow-lg"
                : "bg-[var(--background-subtle)] border border-[var(--border)]"
            }`}
          >
            {isFocusMode ? (
              <Zap className="h-5 w-5 text-white" />
            ) : (
              <Focus className="h-5 w-5 text-[var(--text-muted)]" />
            )}
          </div>

          <div className="flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              {isFocusMode ? "Focus Mode Active" : "Focus Mode"}
            </h4>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {isFocusMode
                ? "You're in deep work mode"
                : "Enter deep work mode"}
            </p>
          </div>

          <button
            onClick={toggleFocusMode}
            className={`relative h-6 w-11 rounded-full transition-all flex-shrink-0 ${
              isFocusMode
                ? "bg-[var(--primary)]"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                isFocusMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Features list */}
        <div className="space-y-1.5 border-t border-[var(--border)] pt-3">
          <div className="flex items-center gap-2 text-xs">
            {isFocusMode ? (
              <BellOff className="w-3.5 h-3.5 text-[var(--primary)]" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            )}
            <span className={isFocusMode ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
              {isFocusMode ? "Notifications muted" : "Mute notifications"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isFocusMode ? "bg-red-500" : "bg-[var(--text-muted)]"}`} />
            <span className={isFocusMode ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
              {isFocusMode ? "Status: Busy" : "Set status to Busy"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Zap className={`w-3.5 h-3.5 ${isFocusMode ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`} />
            <span className={isFocusMode ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
              {isFocusMode ? "Deep work mode enabled" : "Enable deep work mode"}
            </span>
          </div>
        </div>

        {isFocusMode && (
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <p className="text-xs text-center text-[var(--primary)] font-medium">
              💪 Stay focused and crush your goals!
            </p>
          </div>
        )}
      </div>

      {!isFocusMode && (
        <Button
          onClick={toggleFocusMode}
          className="w-full mt-3"
          size="sm"
        >
          <Zap className="w-4 h-4 mr-2" />
          Activate Focus Mode
        </Button>
      )}
    </div>
  );
}
