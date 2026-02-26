"use client";

import dynamic from "next/dynamic";

function LeavesSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-white/5" />
      <div className="h-20 rounded-2xl bg-white/5" />
      <div className="h-20 rounded-2xl bg-white/5" />
      <div className="h-20 rounded-2xl bg-white/5" />
      <div className="h-20 rounded-2xl bg-white/5" />
    </div>
  );
}

const LeavesClient = dynamic(
  () => import("@/components/leaves/LeavesClient"),
  {
    ssr: false,
    loading: () => <LeavesSkeleton />,
  }
);

export default function LeavesPage() {
  return <LeavesClient />;
}
