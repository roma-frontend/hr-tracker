'use client';

import { useMemo } from 'react';

export function useEffectivePresenceStatus(
  presenceStatus: string | undefined,
  leaves?: Array<{
    startDate: string;
    endDate: string;
    status: 'pending' | 'approved' | 'rejected';
  }>,
) {
  return useMemo(() => {
    if (!presenceStatus) return 'available';

    if (!leaves || leaves.length === 0) {
      return presenceStatus;
    }

    const today = new Date().toISOString().split('T')[0];
    if (!today) return presenceStatus;

    const hasActiveLeave = leaves.some((leave) => {
      return leave.status === 'approved' && leave.startDate <= today && today <= leave.endDate;
    });

    return hasActiveLeave ? 'out_of_office' : presenceStatus;
  }, [presenceStatus, leaves]);
}
