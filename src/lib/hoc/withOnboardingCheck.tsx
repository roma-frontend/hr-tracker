"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ShieldLoader } from "@/components/ui/ShieldLoader";

interface WithOnboardingCheckProps {
  children: React.ReactNode;
}

export function withOnboardingCheck<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithOnboardingCheck(props: P) {
    const { user, needsOnboarding } = useAuthStore();
    const isOnboardingPage = typeof window !== 'undefined' && 
      window.location.pathname.startsWith('/onboarding');

    // If user needs onboarding and not already on onboarding page
    if (user && needsOnboarding && !isOnboardingPage) {
      // Redirect immediately
      if (typeof window !== 'undefined') {
        console.log("[withOnboardingCheck] 🚨 Redirecting to onboarding");
        window.location.href = '/onboarding/select-organization';
      }
      
      // Show loader during redirect
      return (
        <div className="flex h-screen items-center justify-center bg-[var(--background)]">
          <ShieldLoader size="lg" />
        </div>
      );
    }

    // Render wrapped component
    return <WrappedComponent {...props} />;
  };
}
