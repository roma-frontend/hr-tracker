'use client';

import dynamic from 'next/dynamic';
import { ShieldLoader } from '@/components/ui/ShieldLoader';
import { useTranslation } from 'react-i18next';

/**
 * Lazy-loaded face recognition component.
 * @vladmandic/face-api (~2MB) loads ONLY when this component mounts.
 */

function LazyFaceRecognitionLoading() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <ShieldLoader size="sm" variant="inline" />
      <p className="text-sm text-muted-foreground">{t('lazy.loadingFaceRecognition')}</p>
    </div>
  );
}

const FaceRecognitionInner = dynamic(
  () => import('@/components/auth/FaceLogin').then((mod) => ({ default: mod.FaceLogin })),
  {
    ssr: false,
    loading: () => <LazyFaceRecognitionLoading />,
  },
);

export default FaceRecognitionInner;
