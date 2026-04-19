'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuthSync() {
  const { logout } = useAuthStore();

  useEffect(() => {
    // Listen for auth state changes from server
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'logout') {
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logout]);

  return null;
}
