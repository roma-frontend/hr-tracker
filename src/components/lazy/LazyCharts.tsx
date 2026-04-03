'use client';

import dynamic from 'next/dynamic';
import { ShieldLoader } from '@/components/ui/ShieldLoader';

const ChartLoading = () => (
  <div className="flex items-center justify-center h-64">
    <ShieldLoader size="sm" variant="inline" />
  </div>
);

/**
 * Lazy-loaded Recharts components.
 * Recharts + D3 load ONLY when charts are rendered.
 */
export const LazyBarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), {
  ssr: false,
  loading: ChartLoading,
});

export const LazyLineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), {
  ssr: false,
  loading: ChartLoading,
});

export const LazyPieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), {
  ssr: false,
  loading: ChartLoading,
});

export const LazyAreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart), {
  ssr: false,
  loading: ChartLoading,
});
