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
  const [isDone, setIsDone] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const contentReadyRef = useRef(false);
  const minTimeElapsedRef = useRef(false);

  useEffect(() => {
    // Skip if already set (StrictMode double-mount protection)
    if (timerSet || timerSetRef.current) {
      setIsDone(true);
      contentReadyRef.current = true;
      return;
    }
    timerSet = true;
    timerSetRef.current = true;

    // Minimum display time: 2s for smooth UX
    // After that, wait for content to signal it's ready
    const minTimer = setTimeout(() => {
      minTimeElapsedRef.current = true;
    }, 2000);

    return () => clearTimeout(minTimer);
  }, []);

  const markReady = useCallback(() => {
    contentReadyRef.current = true;
    setContentReady(true);
  }, []);

  // Show content when BOTH conditions are met:
  // 1. Minimum time (2s) has elapsed
  // 2. Content has signaled it's ready
  useEffect(() => {
    if (minTimeElapsedRef.current && contentReadyRef.current) {
      setIsDone(true);
    }
  }, [contentReady]);

  const showContent = isDone;

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
