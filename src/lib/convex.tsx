'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode, useEffect } from 'react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Dynamically preconnect to Convex only when the provider mounts
  // (avoids Lighthouse "unused preconnect" warning on static pages)
  useEffect(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) return;

    const extractOrigin = (url: string) => {
      try {
        return new URL(url).origin;
      } catch {
        return null;
      }
    };
    const origin = extractOrigin(convexUrl);
    if (!origin) return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
