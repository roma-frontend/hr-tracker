'use client';

import { useSubscription, type Plan } from './useSubscription';

// ── Feature matrix per plan ────────────────────────────────────────────────────
// Add new features here as the product grows
export interface PlanFeatures {
  analytics: boolean;       // Advanced Analytics page
  reports: boolean;         // Reports & CSV export
  aiChat: boolean;          // AI Leave Assistant / Chat
  sla: boolean;             // SLA settings & monitoring
  apiAccess: boolean;       // API access
  customPolicies: boolean;  // Custom leave policies
  calendarSync: boolean;    // Google/Outlook calendar sync
  maxEmployees: number | null; // null = unlimited
}

const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    analytics: false,
    reports: false,
    aiChat: false,
    sla: false,
    apiAccess: false,
    customPolicies: false,
    calendarSync: false,
    maxEmployees: 5,
  },
  starter: {
    analytics: false,
    reports: false,
    aiChat: false,
    sla: false,
    apiAccess: false,
    customPolicies: false,
    calendarSync: false,
    maxEmployees: 50,
  },
  professional: {
    analytics: true,
    reports: true,
    aiChat: true,
    sla: true,
    apiAccess: true,
    customPolicies: true,
    calendarSync: true,
    maxEmployees: 200,
  },
  enterprise: {
    analytics: true,
    reports: true,
    aiChat: true,
    sla: true,
    apiAccess: true,
    customPolicies: true,
    calendarSync: true,
    maxEmployees: null,
  },
};

export const PLAN_LABELS: Record<Plan, string> = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

export const UPGRADE_PLAN: Record<Plan, Plan | null> = {
  free: 'starter',
  starter: 'professional',
  professional: 'enterprise',
  enterprise: null,
};

export function usePlanFeatures() {
  const { subscription, loading } = useSubscription();

  // If subscription is active (paid), use plan features
  // If not active (canceled, past_due, free), fall back to free tier
  const effectivePlan: Plan = subscription.isActive ? subscription.plan : 'free';
  const features = PLAN_FEATURES[effectivePlan];

  function hasFeature(feature: keyof PlanFeatures): boolean {
    return !!features[feature];
  }

  return {
    loading,
    plan: effectivePlan,
    rawPlan: subscription.plan,
    features,
    hasFeature,
    subscription,
  };
}
