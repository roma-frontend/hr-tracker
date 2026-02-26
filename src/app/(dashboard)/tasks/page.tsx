"use client";

import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/useAuthStore";

const TasksClient = dynamic(
  () => import("@/components/tasks/TasksClient"),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-white/5" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-white/5" />
        ))}
      </div>
    ),
  }
);

export default function TasksPage() {
  const { user } = useAuthStore();

  return (
    <TasksClient
      userId={user?.id ?? ""}
      userRole={user?.role ?? "employee"}
    />
  );
}
