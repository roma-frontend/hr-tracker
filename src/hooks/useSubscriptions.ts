import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const SUBSCRIPTION_QUERY_KEYS = {
  all: ['subscriptions'] as const,
  list: () => [...SUBSCRIPTION_QUERY_KEYS.all, 'list'] as const,
};

async function fetchSubscription<T>(action: string, params?: Record<string, string>): Promise<T> {
  const url = new URL('/api/org', window.location.origin);
  url.searchParams.set('action', action);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  const json = await res.json();
  return json.data;
}

async function mutateSubscription<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/org?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Mutation failed' }));
    throw new Error(error.error || 'Mutation failed');
  }
  const json = await res.json();
  return json.data;
}

export function useListAllSubscriptions(isSuperadmin = false) {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.list(),
    queryFn: () => fetchSubscription<any[]>('list-subscriptions'),
    enabled: isSuperadmin,
  });
}

export function useCreateManualSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      organizationId: string;
      plan: 'starter' | 'professional' | 'enterprise';
      customPrice?: number;
      notes?: string;
    }) => mutateSubscription<any>('create-manual-subscription', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.all });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { subscriptionId: string }) =>
      mutateSubscription<any>('cancel-subscription', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.all });
    },
  });
}
