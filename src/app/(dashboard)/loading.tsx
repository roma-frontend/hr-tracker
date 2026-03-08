"use client";

import { ShieldLoader } from "@/components/ui/ShieldLoader";

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
      <ShieldLoader size="lg" />
    </div>
  );
}
