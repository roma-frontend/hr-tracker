'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { ShieldLoader } from '@/components/ui/ShieldLoader';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function OAuthSyncLoader() {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // OAuthSyncLoader is no longer needed with Supabase
    // This component is kept for backward compatibility but does nothing
    setIsSyncing(false);
  }, [pathname]);

  return null;
}
