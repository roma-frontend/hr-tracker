import { useState, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';

type PresenceStatus = 'available' | 'in_meeting' | 'in_call' | 'out_of_office' | 'busy';

export function usePresenceStatus(userId?: Id<'users'>) {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const currentUser = useQuery(api.users.queries.getCurrentUser, userId ? {} : 'skip');

  const updateStatusMutation = useMutation(api.users.mutations.updatePresenceStatus);

  const openStatusModal = useCallback(() => {
    setIsStatusModalOpen(true);
  }, []);

  const closeStatusModal = useCallback(() => {
    setIsStatusModalOpen(false);
  }, []);

  const updateStatus = useCallback(
    async (status: string, message?: string) => {
      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      // Validate status is one of the allowed types
      const validStatuses: PresenceStatus[] = [
        'available',
        'in_meeting',
        'in_call',
        'out_of_office',
        'busy',
      ];

      if (!validStatuses.includes(status as PresenceStatus)) {
        toast.error('Invalid status');
        return;
      }

      try {
        await updateStatusMutation({
          userId,
          presenceStatus: status as PresenceStatus,
          outOfOfficeMessage: message,
        });
        return true;
      } catch (error) {
        console.error('Failed to update status:', error);
        toast.error('Failed to update status');
        return false;
      }
    },
    [userId, updateStatusMutation],
  );

  return {
    isStatusModalOpen,
    openStatusModal,
    closeStatusModal,
    updateStatus,
    currentStatus: currentUser?.presenceStatus,
  };
}
