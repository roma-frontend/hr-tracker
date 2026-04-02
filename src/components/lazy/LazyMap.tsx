'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

/**
 * Lazy-loaded Map component.
 * Leaflet + react-leaflet load ONLY when the map is shown.
 */
const LazyMap = dynamic(
  () => import('@/components/maps/MapView').then((mod) => mod.default || mod),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-muted-foreground/25">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    ),
  },
);

export default LazyMap;
