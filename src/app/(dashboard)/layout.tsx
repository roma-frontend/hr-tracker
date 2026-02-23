import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/layout/Providers";
import { ChatWidget } from "@/components/ai/ChatWidget";

export const metadata: Metadata = {
  title: "HR Office — Leave Monitoring",
  description: "HR Leave Monitoring System",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      {children}
      <ChatWidget />
    </Providers>
  );
}
