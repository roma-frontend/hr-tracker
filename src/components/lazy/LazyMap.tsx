'use client';

import dynamic from 'next/dynamic';
import { ShieldLoader } from '@/components/ui/ShieldLoader';
import { useTranslation } from 'react-i18next';

/**
 * Lazy-loaded Map component.
 * Leaflet + react-leaflet load ONLY when the map is shown.
 */

function LazyMapLoading() {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-muted-foreground/25">
      <div className="flex flex-col items-center gap-2">
        <ShieldLoader size="sm" variant="inline" />
        <p className="text-sm text-muted-foreground">{t('lazy.loadingMap')}</p>
      </div>
    </div>
  );
}

const LazyMap = dynamic(
  () => import('@/components/drivers/DriverMap').then((mod) => ({ default: mod.DriverMap })),
  {
    ssr: false,
    loading: () => <LazyMapLoading />,
  },
);

export default LazyMap;
