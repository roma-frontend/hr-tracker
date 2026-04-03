'use client';

import dynamic from 'next/dynamic';
import { ShieldLoader } from '@/components/ui/ShieldLoader';

/**
 * Lazy-loaded Three.js/R3F component.
 * three.js + @react-three/fiber load ONLY when needed.
 */
const ThreeScene = dynamic(
  () => import('@/components/landing/SphereMesh').then((mod) => ({ default: mod.SphereMesh })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <ShieldLoader size="sm" variant="inline" />
      </div>
    ),
  },
);

export default ThreeScene;
