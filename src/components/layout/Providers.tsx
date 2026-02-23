"use client";

import React, { useEffect } from "react";
import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/useAuthStore";
import { getSessionAction } from "@/actions/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, isAuthenticated } = useAuthStore();

  // Load user session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        console.log("🔄 Loading session...");
        const session = await getSessionAction();
        console.log("📦 Session loaded:", session);
        
        if (session && session.userId) {
          const userData = {
            id: session.userId,
            name: session.name,
            email: session.email,
            role: session.role as 'admin' | 'supervisor' | 'employee',
            department: session.department,
            position: session.position,
            employeeType: session.employeeType as 'staff' | 'contractor',
            avatar: session.avatar,
          };
          
          console.log("✅ Setting user in store:", userData);
          setUser(userData);
        } else {
          console.warn("⚠️ No valid session found");
        }
      } catch (error) {
        console.error("❌ Failed to load session:", error);
      }
    }
    
    // Always try to load session on mount
    console.log("🚀 Providers mounted, isAuthenticated:", isAuthenticated);
    loadSession();
  }, []); // Run only once on mount

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
    </div>
  );
}
