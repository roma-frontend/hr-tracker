"use client";

import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/useAuthStore";

// Dynamically import heavy dashboard components — they are large bundles
// with recharts, framer-motion etc. Loading them on demand saves ~120KB on
// the initial JS payload for pages that don't need them yet.
const DashboardClient = dynamic(
  () => import("@/components/dashboard/DashboardClient"),
  { ssr: false, loading: () => <DashboardSkeleton /> }
);

const EmployeeDashboard = dynamic(
  () => import("@/components/dashboard/EmployeeDashboard"),
  { ssr: false, loading: () => <DashboardSkeleton /> }
);

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-white/5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64 rounded-2xl bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (user?.role === "employee") {
    return <EmployeeDashboard />;
  }

  return <DashboardClient />;
}
