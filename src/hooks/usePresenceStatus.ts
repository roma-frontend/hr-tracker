'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';

type PresenceStatus = 'available' | 'in_meeting' | 'in_call' | 'out_of_office' | 'busy';

export function usePresenceStatus(userId?: string) {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const effectiveUserId = userId || user?.id;

  const { data: currentUser } = useQuery({
    queryKey: ['user', effectiveUserId, 'current'],
    queryFn: async () => {
      const res = await fetch(`/api/users?action=get-current-user`);
      if (!res.ok) throw new Error(t('presence.fetchUserFailed'));
      const json = await res.json();
      return json.data;
    },
    enabled: !!effectiveUserId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { userId: string; presenceStatus: string; outOfOfficeMessage?: string }) => {
      const res = await fetch('/api/users?action=update-presence-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('presence.updateFailed'));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', effectiveUserId, 'current'] });
      queryClient.invalidateQueries({ queryKey: ['productivity', 'team-presence'] });
    },
  });

  const openStatusModal = useCallback(() => {
    setIsStatusModalOpen(true);
  }, []);

  const closeStatusModal = useCallback(() => {
    setIsStatusModalOpen(false);
  }, []);

  const updateStatus = useCallback(
    async (status: string, message?: string) => {
      if (!effectiveUserId) {
        toast.error(t('presence.userIdNotFound', t('presence.userIdNotFound')));
        return;
      }

      const validStatuses: PresenceStatus[] = [
        'available',
        'in_meeting',
        'in_call',
        'out_of_office',
        'busy',
      ];

      if (!validStatuses.includes(status as PresenceStatus)) {
        toast.error(t('presence.invalidStatus', t('presence.invalidStatus')));
        return;
      }

      try {
        await updateStatusMutation.mutateAsync({
          userId: effectiveUserId,
          presenceStatus: status as PresenceStatus,
          outOfOfficeMessage: message,
        });
        return true;
      } catch (error) {
        console.error('Failed to update status:', error);
        toast.error(t('presence.updateFailed', t('presence.updateFailed')));
        return false;
      }
    },
    [effectiveUserId, updateStatusMutation],
  );

  return {
    isStatusModalOpen,
    openStatusModal,
    closeStatusModal,
    updateStatus,
    currentStatus: currentUser?.presence_status,
  };
}
