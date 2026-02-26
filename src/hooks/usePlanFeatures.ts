"use client";

import { useSubscription, type PlanType } from "./useSubscription";
export type { PlanType };

// ── Определение функций по плану ─────────────────────────────────────────────
export interface PlanFeatures {
  // Аналитика
  analytics: boolean;
  advancedAnalytics: boolean;   // professional+

  // Отчёты
  reports: boolean;
  exportReports: boolean;       // professional+

  // AI функции
  aiChat: boolean;              // professional+
  aiInsights: boolean;          // professional+
  aiLeaveAssistant: boolean;    // professional+

  // SLA
  slaSettings: boolean;         // professional+

  // Сотрудники
  maxEmployees: number;         // starter: 50, professional: 200, enterprise: unlimited

  // Calendar sync
  calendarSync: boolean;        // professional+

  // Telegram/интеграции
  integrations: boolean;        // enterprise only
}

const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  starter: {
    analytics: true,
    advancedAnalytics: false,
    reports: false,
    exportReports: false,
    aiChat: false,
    aiInsights: false,
    aiLeaveAssistant: false,
    slaSettings: false,
    maxEmployees: 50,
    calendarSync: false,
    integrations: false,
  },
  professional: {
    analytics: true,
    advancedAnalytics: true,
    reports: true,
    exportReports: true,
    aiChat: true,
    aiInsights: true,
    aiLeaveAssistant: true,
    slaSettings: true,
    maxEmployees: 200,
    calendarSync: true,
    integrations: false,
  },
  enterprise: {
    analytics: true,
    advancedAnalytics: true,
    reports: true,
    exportReports: true,
    aiChat: true,
    aiInsights: true,
    aiLeaveAssistant: true,
    slaSettings: true,
    maxEmployees: Infinity,
    calendarSync: true,
    integrations: true,
  },
};

export const PLAN_LABELS: Record<PlanType, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

export const PLAN_PRICES: Record<PlanType, string> = {
  starter: "$29/mo",
  professional: "$79/mo",
  enterprise: "Custom",
};

export const PLAN_UPGRADE_URL: Record<PlanType, string> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_PROFESSIONAL ?? "/contact",
  professional: "/contact",
  enterprise: "/contact",
};

// Возвращает true, если requiredPlan <= currentPlan
export function planIncludes(currentPlan: PlanType, requiredPlan: PlanType): boolean {
  const order: PlanType[] = ["starter", "professional", "enterprise"];
  return order.indexOf(currentPlan) >= order.indexOf(requiredPlan);
}

export function usePlanFeatures() {
  const { plan, isActive, isLoading } = useSubscription();

  const features = isActive ? PLAN_FEATURES[plan] : PLAN_FEATURES.starter;

  function canAccess(feature: keyof PlanFeatures): boolean {
    if (isLoading) return false;
    const val = features[feature];
    if (typeof val === "boolean") return val;
    return true; // числовые значения — всегда доступны, но ограничены
  }

  function requiresPlan(feature: keyof PlanFeatures): PlanType | null {
    for (const p of ["starter", "professional", "enterprise"] as PlanType[]) {
      if (PLAN_FEATURES[p][feature] === true || (typeof PLAN_FEATURES[p][feature] === "number" && (PLAN_FEATURES[p][feature] as number) > 0)) {
        return p;
      }
    }
    return null;
  }

  return {
    features,
    canAccess,
    requiresPlan,
    plan,
    isLoading,
  };
}
