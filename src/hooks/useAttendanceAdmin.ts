import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';

export function useTodaySummary() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['attendance', 'today-summary', user?.id],
    queryFn: async () => {
      const url = new URL('/api/attendance', window.location.origin);
      url.searchParams.set('type', 'today-summary');

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch today summary');
      return res.json();
    },
    enabled: !!user?.id && ['admin', 'supervisor', 'superadmin'].includes(user?.role || ''),
  });
}

export function useTodayAllAttendance() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['attendance', 'today-all', user?.id],
    queryFn: async () => {
      const url = new URL('/api/attendance', window.location.origin);
      url.searchParams.set('type', 'today-all');

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch today attendance');
      return res.json();
    },
    enabled: !!user?.id && ['admin', 'supervisor', 'superadmin'].includes(user?.role || ''),
  });
}

export function useAllEmployeesOverview(month?: string) {
  const { user } = useAuthStore();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ['attendance', 'all-employees', user?.id, currentMonth],
    queryFn: async () => {
      const url = new URL('/api/attendance', window.location.origin);
      url.searchParams.set('type', 'all-employees');
      url.searchParams.set('month', currentMonth);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch all employees overview');
      return res.json();
    },
    enabled: !!user?.id && ['admin', 'supervisor', 'superadmin'].includes(user?.role || ''),
  });
}

export function useNeedsRating() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['attendance', 'needs-rating', user?.id],
    queryFn: async () => {
      const url = new URL('/api/attendance', window.location.origin);
      url.searchParams.set('type', 'needs-rating');

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch needs rating');
      return res.json();
    },
    enabled: !!user?.id && ['admin', 'supervisor', 'superadmin'].includes(user?.role || ''),
  });
}

export function useCreateRating() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'create-rating', ...data }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create rating');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'needs-rating'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'all-employees'] });
    },
  });
}
