'use client';

import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import Preloader from './Preloader';

// Track if timer has been set (persists across StrictMode remounts)
let timerSet = false;

// Context to track content readiness
const LoadingContext = createContext<(() => void) | null>(null);

export function useLoadingReady() {
  return useContext(LoadingContext);
}

export function LoadingProvider({
  children,
  cookieBanner,
}: {
  children: React.ReactNode;
  cookieBanner?: React.ReactNode;
}) {
  const timerSetRef = useRef(false);
  const [showContent, setShowContent] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const contentReadyRef = useRef(false);

  useEffect(() => {
    // Skip if already set (StrictMode double-mount protection)
    if (timerSet || timerSetRef.current) {
      setShowContent(true);
      contentReadyRef.current = true;
      setMinTimeElapsed(true);
      return;
    }
    timerSet = true;
    timerSetRef.current = true;

    // Minimum display time: 2s for smooth UX
    const minTimer = setTimeout(() => setMinTimeElapsed(true), 2000);

    // Fallback: force show after 5s max
    const fallbackTimer = setTimeout(() => setShowContent(true), 5000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const markReady = useCallback(() => {
    contentReadyRef.current = true;
    // If min time already elapsed, show content immediately
    if (minTimeElapsed) {
      setShowContent(true);
    }
  }, [minTimeElapsed]);

  // When min time elapses, check if content is ready
  useEffect(() => {
    if (minTimeElapsed && contentReadyRef.current) {
      setShowContent(true);
    }
  }, [minTimeElapsed]);

  return (
    <LoadingContext.Provider value={markReady}>
      <Preloader />
      <div
        style={{
          opacity: showContent ? 1 : 0,
          transition: 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          pointerEvents: showContent ? 'auto' : 'none',
        }}
      >
        {children}
        {showContent && cookieBanner}
      </div>
    </LoadingContext.Provider>
  );
}
