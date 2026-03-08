"use client";

import React from "react";
import { useStatusUpdate } from "@/context/StatusUpdateContext";
import {
  X,
  CheckCircle2,
  Clock,
  Phone,
  Home,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const statusConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    border: string;
    text: string;
    accent: string;
    type: "success" | "warning" | "info" | "error" | "neutral";
  }
> = {
  available: {
    icon: CheckCircle2,
    bg: "from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30",
    border: "border-green-300 dark:border-green-800/50",
    text: "text-green-900 dark:text-green-100",
    accent: "text-green-700 dark:text-green-400",
    type: "success",
  },
  in_meeting: {
    icon: Clock,
    bg: "from-yellow-100 to-amber-100 dark:from-yellow-950/30 dark:to-amber-950/30",
    border: "border-yellow-300 dark:border-yellow-800/50",
    text: "text-yellow-900 dark:text-yellow-100",
    accent: "text-yellow-700 dark:text-yellow-400",
    type: "warning",
  },
  in_call: {
    icon: Phone,
    bg: "from-blue-100 to-sky-100 dark:from-blue-950/30 dark:to-sky-950/30",
    border: "border-blue-300 dark:border-blue-800/50",
    text: "text-blue-900 dark:text-blue-100",
    accent: "text-blue-700 dark:text-blue-400",
    type: "info",
  },
  out_of_office: {
    icon: AlertTriangle,
    bg: "from-orange-100 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30",
    border: "border-orange-300 dark:border-orange-800/50",
    text: "text-orange-900 dark:text-orange-100",
    accent: "text-orange-700 dark:text-orange-400",
    type: "warning",
  },
  busy: {
    icon: Zap,
    bg: "from-red-100 to-rose-100 dark:from-red-950/30 dark:to-red-950/30",
    border: "border-red-300 dark:border-red-800/50",
    text: "text-red-900 dark:text-red-100",
    accent: "text-red-700 dark:text-red-400",
    type: "error",
  },
};

const defaultConfig = statusConfig.available;

export function StatusUpdateBanner() {
  const { notification, hideNotification } = useStatusUpdate();
  const { t } = useTranslation();

  if (!notification) return null;

  const config = statusConfig[notification.statusKey] || defaultConfig;
  const Icon = config.icon;
  const hint = t(`status.${notification.statusKey}.notification`, "");

  return (
    <div
      className={`w-full bg-gradient-to-r ${config.bg} border-b ${config.border} shadow-sm`}
    >
      <div className="max-w-full mx-auto px-4 py-3 flex items-start justify-between gap-3">
        {/* Left: Icon and Message */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            <Icon className={`w-5 h-5 ${config.accent}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold ${config.text} truncate`}>
              {t("status.updated", "Status Updated")} —{" "}
              {notification.statusLabel}
            </p>
            {hint && (
              <p
                className={`text-xs mt-0.5 ${config.accent} opacity-90 leading-relaxed`}
              >
                {hint}
              </p>
            )}
          </div>
        </div>

        {/* Right: Close Button */}
        <button
          onClick={hideNotification}
          className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${config.accent}`}
          aria-label={t("common.close", "Close")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
