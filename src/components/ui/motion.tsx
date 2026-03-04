/**
 * Lazy-loaded Framer Motion wrapper
 * Экономит ~85 KB на страницах без анимаций
 */

'use client';

import dynamic from 'next/dynamic';
import type { HTMLMotionProps } from 'framer-motion';

// Lazy load framer-motion - КРИТИЧНО для bundle size!
const FramerMotion = dynamic(() => import('framer-motion').then(mod => ({
  default: {
    motion: mod.motion,
    AnimatePresence: mod.AnimatePresence,
  }
})), {
  ssr: false,
  loading: () => null,
});

// Re-export motion components
export const motion = new Proxy({} as typeof import('framer-motion').motion, {
  get: (_, prop: string) => {
    return dynamic(
      () => import('framer-motion').then(mod => ({ default: mod.motion[prop as keyof typeof mod.motion] })),
      { ssr: false }
    );
  },
});

// Re-export AnimatePresence
export const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })),
  { ssr: false }
);

// Типы для TypeScript
export type { HTMLMotionProps };
