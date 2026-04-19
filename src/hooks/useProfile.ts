import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';

const PROFILE_QUERY_KEYS = {
  user: (userId: string) => ['profile', 'user', userId],
  stats: (userId: string) => ['profile', 'stats', userId],
};

async function fetchUser(userId: string) {
  const params = new URLSearchParams({
    action: 'get-user-by-id',
    userId,
  });
  const res = await fetch(`/api/users?${params}`);
  if (!res.ok) throw new Error(t('profile.fetchUserFailed'));
  const json = await res.json();
  return json.data;
}

async function fetchUserStats(userId: string) {
  const params = new URLSearchParams({
    action: 'get-user-stats',
    userId,
  });
  const res = await fetch(`/api/users?${params}`);
  if (!res.ok) throw new Error(t('profile.fetchStatsFailed'));
  const json = await res.json();
  return json.data;
}

export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.user(userId || ''),
    queryFn: () => fetchUser(userId!),
    enabled: !!userId,
  });
}

export function useUserStats(userId?: string) {
  const { t } = useTranslation();
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.stats(userId || ''),
    queryFn: () => fetchUserStats(userId!),
    enabled: !!userId,
  });
}

export function useUpdateOwnProfile() {
  const queryClient = useQueryClient();
  const { user, login } = useAuthStore();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone?: string;
      location?: string;
    }) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-own-profile',
          ...data,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t('profile.updateFailed'));
      }
      return res.json();
    },
    onSuccess: (response, variables) => {
      if (user) {
        login({ ...user, name: variables.name, email: variables.email });
      }
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.user(user?.id || '') });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.stats(user?.id || '') });
      toast.success(t('profile.updated', t('profile.updated')));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('profile.updateFailed', t('profile.updateFailed')));
    },
  });
}
