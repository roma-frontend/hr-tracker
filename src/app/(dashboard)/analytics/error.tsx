"use client";

import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          {t("analytics.errorTitle", "Analytics Error")}
        </h2>
        <p className="text-[var(--text-muted)] text-sm max-w-md">
          {t("analytics.errorDescription", "Something went wrong loading the analytics dashboard. Please try again.")}
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
      >
        <RefreshCw className="w-4 h-4" />
        {t("common.tryAgain", "Try Again")}
      </button>
    </div>
  );
}
