"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/useAuthStore";
import { getSessionAction } from "@/actions/auth";

const ChatWidget = dynamic(
  () => import("@/components/ai/ChatWidget").then((m) => m.ChatWidget),
  { ssr: false, loading: () => null }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    async function loadSession() {
      try {
        const session = await getSessionAction();
        if (session?.userId) {
          setUser({
            id: session.userId,
            name: session.name,
            email: session.email,
            role: session.role as "admin" | "supervisor" | "employee",
            department: session.department,
            position: session.position,
            employeeType: session.employeeType as "staff" | "contractor",
            avatar: session.avatar,
          });
        }
      } catch {
        // Session load failed silently
      }
    }
    loadSession();
  }, []);

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden transition-colors duration-300">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      {/* AI Chat Widget - lazy loaded */}
      <ChatWidget />
    </div>
  );
}
