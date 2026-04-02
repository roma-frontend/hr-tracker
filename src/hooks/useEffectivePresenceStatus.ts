import { useMemo } from 'react';
import type { Id } from '../../convex/_generated/dataModel';

/**
 * Calculate effective presence status considering active leaves
 * If user has approved leave today → "out_of_office"
 * Otherwise → return user's current presenceStatus
 *
 * This is useful for the client side when you have leave data available
 */
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

    // If no leave data, just return the current status
    if (!leaves || leaves.length === 0) {
      return presenceStatus;
    }

    // Check if user has an approved leave today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    if (!today) return presenceStatus;

    const hasActiveLeave = leaves.some((leave) => {
      return leave.status === 'approved' && leave.startDate <= today && today <= leave.endDate;
    });

    return hasActiveLeave ? 'out_of_office' : presenceStatus;
  }, [presenceStatus, leaves]);
}
