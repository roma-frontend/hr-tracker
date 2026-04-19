'use client';

import { useAuthSync } from '@/hooks/useAuthSync';
import { ReactNode } from 'react';

/**
 * This component renders useAuthSync alongside children.
 * Auth sync is always active since Convex has been replaced with Supabase.
 */
export function AuthSyncProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthSyncInner />
      {children}
    </>
  );
}

function AuthSyncInner() {
  useAuthSync();
  return null;
}
