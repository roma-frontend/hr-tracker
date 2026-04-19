'use client';

import { useState, useEffect } from 'react';
import { MaintenanceAutoLogoutInner } from '@/components/MaintenanceAutoLogoutInner';

export function MaintenanceAutoLogout() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <MaintenanceAutoLogoutInner />;
}
