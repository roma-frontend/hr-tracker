"use client";

import dynamic from "next/dynamic";

function EmployeesSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-white/5" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="h-40 rounded-2xl bg-white/5" />
        <div className="h-40 rounded-2xl bg-white/5" />
        <div className="h-40 rounded-2xl bg-white/5" />
        <div className="h-40 rounded-2xl bg-white/5" />
        <div className="h-40 rounded-2xl bg-white/5" />
        <div className="h-40 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

// EmployeesClient pulls face-api.js + large modal components — lazy load
const EmployeesClient = dynamic(
  () => import("@/components/employees/EmployeesClient"),
  {
    ssr: false,
    loading: () => <EmployeesSkeleton />,
  }
);

export default function EmployeesPage() {
  return <EmployeesClient />;
}
