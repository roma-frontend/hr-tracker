"use client";

import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  // Show limited dashboard for employees, full dashboard for admin/supervisor
  if (user?.role === "employee") {
    return <EmployeeDashboard />;
  }
  
  return <DashboardClient />;
}
