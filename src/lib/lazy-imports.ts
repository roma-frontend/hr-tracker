/**
 * Централизованные lazy imports для тяжёлых библиотек
 * Это гарантирует что они НЕ попадут в main bundle
 */

import dynamic from 'next/dynamic';

// ===== FRAMER MOTION (85 KB) =====
export const motion = {
  div: dynamic(() => import('framer-motion').then((m) => ({ default: m.motion.div })), {
    ssr: false,
  }),
  section: dynamic(() => import('framer-motion').then((m) => ({ default: m.motion.section })), {
    ssr: false,
  }),
  button: dynamic(() => import('framer-motion').then((m) => ({ default: m.motion.button })), {
    ssr: false,
  }),
  form: dynamic(() => import('framer-motion').then((m) => ({ default: m.motion.form })), {
    ssr: false,
  }),
  span: dynamic(() => import('framer-motion').then((m) => ({ default: m.motion.span })), {
    ssr: false,
  }),
  h1: dynamic(() => import('framer-motion').then((m) => ({ default: m.motion.h1 })), {
    ssr: false,
  }),
  h2: dynamic(() => import('framer-motion').then((m) => ({ default: m.motion.h2 })), {
    ssr: false,
  }),
  p: dynamic(() => import('framer-motion').then((m) => ({ default: m.motion.p })), { ssr: false }),
};

export const AnimatePresence = dynamic(
  () => import('framer-motion').then((m) => ({ default: m.AnimatePresence })),
  { ssr: false },
);

// ===== RECHARTS (300 KB) =====
export const LazyLineChart = dynamic(
  () => import('recharts').then((m) => ({ default: m.LineChart })),
  { ssr: false },
);

export const LazyBarChart = dynamic(
  () => import('recharts').then((m) => ({ default: m.BarChart })),
  { ssr: false },
);

export const LazyPieChart = dynamic(
  () => import('recharts').then((m) => ({ default: m.PieChart })),
  { ssr: false },
);

export const LazyAreaChart = dynamic(
  () => import('recharts').then((m) => ({ default: m.AreaChart })),
  { ssr: false },
);

// ===== THREE.JS (600 KB) =====
export const LazyCanvas = dynamic(
  () => import('@react-three/fiber').then((m) => ({ default: m.Canvas })),
  { ssr: false },
);

// ===== FACE API (1.5 MB) =====
export const lazyLoadFaceAPI = async () => {
  return await import('@vladmandic/face-api');
};

export default {
  motion,
  AnimatePresence,
  LazyLineChart,
  LazyBarChart,
  LazyPieChart,
  LazyAreaChart,
  LazyCanvas,
  lazyLoadFaceAPI,
};
