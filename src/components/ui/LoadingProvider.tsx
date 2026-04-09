'use client';

import { useState, useEffect } from 'react';
import { Preloader } from '@/components/ui/Preloader';

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load or wait for window load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Show preloader for at least 1.5s for branding

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Preloader isLoading={isLoading} />
      {children}
    </>
  );
}
