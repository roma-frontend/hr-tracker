import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';

export function useLeaves() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'leaves', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/dashboard?type=leaves');
      if (!res.ok) throw new Error('Failed to fetch leaves');
      return res.json();
    },
    enabled: !!user?.id,
  });
}

export function useUsers() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'users', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/dashboard?type=users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    enabled: !!user?.id,
  });
}

export function useUserLeaves() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'user-leaves', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?type=user-leaves`);
      if (!res.ok) throw new Error('Failed to fetch user leaves');
      return res.json();
    },
    enabled: !!user?.id,
  });
}

export function useUserData() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'user-data', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?type=user-data`);
      if (!res.ok) throw new Error('Failed to fetch user data');
      return res.json();
    },
    enabled: !!user?.id,
  });
}

export function useLatestRating() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'latest-rating', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?type=latest-rating`);
      if (!res.ok) throw new Error('Failed to fetch rating');
      return res.json();
    },
    enabled: !!user?.id,
  });
}

export function useMonthlyStats(month?: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'monthly-stats', user?.id, month],
    queryFn: async () => {
      const url = new URL('/api/dashboard', window.location.origin);
      url.searchParams.set('type', 'monthly-stats');
      if (month) url.searchParams.set('month', month);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch monthly stats');
      return res.json();
    },
    enabled: !!user?.id,
  });
}

export function useUserAnalytics() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'user-analytics', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?type=user-analytics`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: !!user?.id,
  });
}

export function useSecurityStats(hours: number = 24) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard', 'security-stats', user?.id, hours],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?type=security-stats`);
      if (!res.ok) throw new Error('Failed to fetch security stats');
      return res.json();
    },
    enabled: !!user?.id && user?.role === 'superadmin',
  });
}
