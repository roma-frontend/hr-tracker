'use client';

import dynamic from 'next/dynamic';
import { ShieldLoader } from '@/components/ui/ShieldLoader';

/**
 * Lazy-loaded face recognition component.
 * face-api.js (~2MB) loads ONLY when this component mounts.
 */
const FaceRecognitionInner = dynamic(
  () => import('@/components/auth/FaceLogin').then((mod) => ({ default: mod.FaceLogin })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <ShieldLoader size="sm" variant="inline" />
        <p className="text-sm text-muted-foreground">Loading face recognition...</p>
      </div>
    ),
  },
);

export default FaceRecognitionInner;
