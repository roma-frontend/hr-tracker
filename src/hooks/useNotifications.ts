import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const NOTIFICATIONS_QUERY_KEYS = {
  all: ['notifications'],
  byUser: (userId: string) => ['notifications', userId],
  unreadCount: (userId: string) => ['notifications', 'unreadCount', userId],
};

async function fetchNotifications(userId: string) {
  const response = await fetch(`/api/notifications?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
}

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: userId ? NOTIFICATIONS_QUERY_KEYS.byUser(userId) : NOTIFICATIONS_QUERY_KEYS.all,
    queryFn: () => fetchNotifications(userId!),
    enabled: !!userId,
    select: (data) => data.notifications || [],
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, isRead: true }),
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications?notificationId=${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-as-read', userId }),
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all });
    },
  });
}
