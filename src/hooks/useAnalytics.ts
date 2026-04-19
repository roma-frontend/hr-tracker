import { useQuery } from '@tanstack/react-query';

const ANALYTICS_QUERY_KEYS = {
  overview: (organizationId?: string) => ['analytics', 'overview', organizationId],
  departmentStats: (organizationId?: string) => ['analytics', 'department-stats', organizationId],
  leaveTrends: (organizationId?: string) => ['analytics', 'leave-trends', organizationId],
  userAnalytics: (userId: string) => ['analytics', 'user', userId],
  teamCalendar: (organizationId?: string) => ['analytics', 'team-calendar', organizationId],
};

async function fetchAnalytics(action: string, params?: Record<string, string>) {
  const searchParams = new URLSearchParams({ action });
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
  }

  const response = await fetch(`/api/analytics?${searchParams.toString()}`);
  if (!response.ok) throw new Error(`Failed to fetch analytics: ${action}`);
  return response.json();
}

export interface AnalyticsOverview {
  totalEmployees: number;
  pendingApprovals: number;
  totalLeaves: number;
  pendingLeaves: number;
  approvedLeaves: number;
  avgApprovalTime: number;
  users: any[];
  leaves: any[];
}

export function useAnalyticsOverview(organizationId?: string) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.overview(organizationId),
    queryFn: () => fetchAnalytics('get-analytics-overview', { organizationId: organizationId || '' }),
    select: (data) => data.data as AnalyticsOverview,
    enabled: true,
  });
}

export interface DepartmentStat {
  department: string;
  employees: number;
  totalPaidLeave: number;
  totalSickLeave: number;
  totalFamilyLeave: number;
  avgPaidLeave: number;
  avgSickLeave: number;
  avgFamilyLeave: number;
}

export function useDepartmentStats(organizationId?: string) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.departmentStats(organizationId),
    queryFn: () => fetchAnalytics('get-department-stats', { organizationId: organizationId || '' }),
    select: (data) => data.data as DepartmentStat[],
    enabled: true,
  });
}

export function useLeaveTrends(organizationId?: string) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.leaveTrends(organizationId),
    queryFn: () => fetchAnalytics('get-leave-trends', { organizationId: organizationId || '' }),
    select: (data) => data.data as any[],
    enabled: true,
  });
}

export interface UserAnalytics {
  user: any;
  totalDaysTaken: number;
  pendingDays: number;
  leavesByType: Record<string, number>;
  userLeaves: any[];
  balances: {
    paid: number;
    sick: number;
    family: number;
  };
}

export function useUserAnalytics(userId: string) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.userAnalytics(userId),
    queryFn: () => fetchAnalytics('get-user-analytics', { userId }),
    select: (data) => data.data as UserAnalytics,
    enabled: !!userId,
  });
}

export function useTeamCalendar(organizationId?: string) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.teamCalendar(organizationId),
    queryFn: () => fetchAnalytics('get-team-calendar', { organizationId: organizationId || '' }),
    select: (data) => data.data as any[],
    enabled: true,
  });
}
