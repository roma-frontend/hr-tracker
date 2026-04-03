import { Suspense } from 'react';
import { ShieldLoader } from '@/components/ui/ShieldLoader';
import SuccessClient from './SuccessClient';

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'var(--background)' }}
        >
          <ShieldLoader size="sm" variant="inline" />
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
