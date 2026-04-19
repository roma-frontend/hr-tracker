'use client';

import { useMyOrganization } from '@/hooks/useOrganizations';

export type PlanType = 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';

export interface SubscriptionData {
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd: boolean;
  trialEnd?: number;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}

export function useSubscription() {
  const { data: organization, isLoading } = useMyOrganization(true);

  const subscription = null as SubscriptionData | null;

  const isActive = !!organization;
  const plan: PlanType = (organization?.plan as PlanType) ?? 'starter';

  const isTrialing = subscription?.status === 'trialing';
  const isCanceled = subscription?.status === 'canceled';
  const isPastDue = subscription?.status === 'past_due';

  const trialDaysLeft =
    isTrialing && subscription?.trialEnd
      ? Math.max(0, Math.ceil((subscription.trialEnd - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  const periodDaysLeft = subscription?.currentPeriodEnd
    ? Math.max(0, Math.ceil((subscription.currentPeriodEnd - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    subscription,
    isLoading,
    isActive,
    plan,
    isTrialing,
    isCanceled,
    isPastDue,
    trialDaysLeft,
    periodDaysLeft,
  };
}
