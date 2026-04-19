'use client';

import { useMaintenanceAutoLogout } from '@/hooks/useMaintenanceAutoLogout';

export function MaintenanceAutoLogoutInner() {
  useMaintenanceAutoLogout();
  return null;
}
