import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: {
    default: "Dashboard | HR Office",
    template: "%s | HR Office",
  },
  description: "HR Office - Manage attendance, leaves, tasks and employees in real-time.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
