"use client";

import React from "react";
import { useStatusUpdate } from "@/context/StatusUpdateContext";
import { X, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function StatusUpdateBanner() {
  const { notification, hideNotification } = useStatusUpdate();
  const { t } = useTranslation();

  if (!notification) return null;

  return (
    <div className="sticky top-0 z-40 w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b border-green-200 dark:border-green-800/50 shadow-md">
      <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: Icon and Message */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-green-900 dark:text-green-100 truncate">
              {t("status.updated", "Status Updated")}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 truncate">
              {t("navbar.yourStatusNowWith", "Your status is now")}{" "}
              <strong>{notification.statusLabel}</strong>
            </p>
          </div>
        </div>

        {/* Right: Close Button */}
        <button
          onClick={hideNotification}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
          aria-label={t("common.close", "Close")}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
