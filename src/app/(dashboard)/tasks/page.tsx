"use client";

import { useEffect, useState } from "react";
import { TasksClient } from "@/components/tasks/TasksClient";
import { useAuthStore } from "@/store/useAuthStore";

export default function TasksPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <TasksClient
      userId={user?.id ?? ""}
      userRole={user?.role ?? "employee"}
    />
  );
}
