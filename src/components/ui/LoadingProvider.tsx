'use client';

import { useState, useEffect } from 'react';
import Preloader from './Preloader';

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Match preloader exit animation start (2s) + exit duration (0.7s) = 2.7s
    const timer = setTimeout(() => setIsDone(true), 2700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Preloader />
      <div
        style={{
          opacity: isDone ? 1 : 0,
          transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          transitionDelay: '1.8s',
          position: isDone ? 'relative' : 'absolute',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
    </>
  );
}
