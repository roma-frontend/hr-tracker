'use client';

import { useEffect } from 'react';
import { useLoadingReady } from './LoadingProvider';

/**
 * Signals to LoadingProvider that this part of the content tree is mounted.
 * Place at the top of your client component tree.
 */
export default function ReadyMarker() {
  const markReady = useLoadingReady();

  useEffect(() => {
    if (markReady) {
      // Defer to ensure all sibling components are mounted
      const timer = setTimeout(markReady, 0);
      return () => clearTimeout(timer);
    }
  }, [markReady]);

  return null;
}
