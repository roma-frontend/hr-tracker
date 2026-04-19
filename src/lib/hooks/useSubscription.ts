'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';

export type Plan = 'starter' | 'professional' | 'enterprise' | 'free';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';

export interface SubscriptionData {
  plan: Plan;
  status: SubscriptionStatus | null;
  trialEnd: number | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  isActive: boolean;
  isTrial: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

async function fetchSubscription(email: string): Promise<SubscriptionData> {
  const response = await fetch(`/api/subscriptions?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch subscription');
  }
  return response.json();
}

export function useSubscription(): { subscription: SubscriptionData; loading: boolean } {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: () => fetchSubscription(user!.email!),
    enabled: !!user?.email,
  });

  const loading = isLoading && !!user?.email;

  if (!data) {
    return {
      loading,
      subscription: {
        plan: 'free',
        status: null,
        trialEnd: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        isActive: false,
        isTrial: false,
        isPastDue: false,
        isCanceled: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      },
    };
  }

  return {
    loading: false,
    subscription: data,
  };
}
