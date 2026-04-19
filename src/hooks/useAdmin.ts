import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const ADMIN_QUERY_KEYS = {
  slaConfig: ['admin', 'sla', 'config'],
  slaStats: (startDate?: number, endDate?: number) => ['admin', 'sla', 'stats', startDate, endDate],
  slaTrend: (days: number) => ['admin', 'sla', 'trend', days],
  pendingWithSLA: ['admin', 'sla', 'pending'],
  serviceBroadcasts: (organizationId: string) => ['admin', 'broadcasts', organizationId],
  maintenanceMode: (organizationId: string) => ['admin', 'maintenance', organizationId],
  calendarExportData: ['admin', 'calendar', 'export'],
  costAnalysis: (period: string) => ['admin', 'cost', period],
  conflicts: ['admin', 'conflicts'],
  smartSuggestions: ['admin', 'suggestions'],
};

export interface SLAConfig {
  id?: string;
  targetResponseTimeHours: number;
  warningThresholdPercent: number;
  criticalThresholdPercent: number;
}

export interface SLAStats {
  complianceRate: number;
  avgResponseTime: number;
  targetResponseTime: number;
  avgSLAScore: number;
  onTime: number;
  breached: number;
  pending: number;
  total: number;
  criticalCount: number;
  warningCount: number;
}

export function useSLAConfig(enabled = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.slaConfig,
    queryFn: async () => {
      const res = await fetch('/api/admin/sla?action=get-config');
      if (!res.ok) throw new Error('Failed to fetch SLA config');
      const json = await res.json();
      return json.data as SLAConfig;
    },
    enabled,
  });
}

export function useSLAStats(startDate?: number, endDate?: number, enabled = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.slaStats(startDate, endDate),
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-stats' });
      if (startDate) params.append('startDate', String(startDate));
      if (endDate) params.append('endDate', String(endDate));
      const res = await fetch(`/api/admin/sla?${params}`);
      if (!res.ok) throw new Error('Failed to fetch SLA stats');
      const json = await res.json();
      return json.data as SLAStats;
    },
    enabled,
  });
}

export function useSLATrend(days = 30, enabled = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.slaTrend(days),
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-trend', days: String(days) });
      const res = await fetch(`/api/admin/sla?${params}`);
      if (!res.ok) throw new Error('Failed to fetch SLA trend');
      const json = await res.json();
      return json.data as any[];
    },
    enabled,
  });
}

export function usePendingWithSLA(enabled = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.pendingWithSLA,
    queryFn: async () => {
      const res = await fetch('/api/admin/sla?action=get-pending-with-sla');
      if (!res.ok) throw new Error('Failed to fetch pending SLA');
      const json = await res.json();
      return json.data as any[];
    },
    enabled,
  });
}

export function useUpdateSLAConfig() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: {
      targetResponseTime: number;
      warningThreshold: number;
      criticalThreshold: number;
      businessHoursOnly?: boolean;
      businessStartHour?: number;
      businessEndHour?: number;
      excludeWeekends?: boolean;
      notifyOnWarning?: boolean;
      notifyOnCritical?: boolean;
      notifyOnBreach?: boolean;
    }) => {
      const res = await fetch('/api/admin/sla?action=update-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update SLA config');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.slaConfig });
      toast.success(t('toasts.slaConfigUpdated'));
    },
    onError: (error) => {
      toast.error(t('toasts.slaConfigUpdateFailed'));
      console.error('Update SLA config error:', error);
    },
  });
}

export function useServiceBroadcasts(organizationId: string, enabled = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.serviceBroadcasts(organizationId),
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-service-broadcasts', organizationId });
      const res = await fetch(`/api/admin?${params}`);
      if (!res.ok) throw new Error('Failed to fetch service broadcasts');
      const json = await res.json();
      return json.data as any[];
    },
    enabled: enabled && !!organizationId,
  });
}

export function useSendServiceBroadcast() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: {
      organizationId: string;
      userId: string;
      title: string;
      content: string;
      icon?: string;
    }) => {
      const res = await fetch('/api/admin?action=send-service-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to send broadcast');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.serviceBroadcasts(variables.organizationId),
      });
      toast.success(t('toasts.broadcastSent'));
    },
    onError: (error) => {
      toast.error(t('toasts.broadcastSendFailed'));
      console.error('Send broadcast error:', error);
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: {
      messageId: string;
      userId: string;
      deleteForEveryone?: boolean;
    }) => {
      const res = await fetch('/api/admin?action=delete-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to delete message');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'broadcasts'] });
      toast.success(t('toasts.messageDeleted'));
    },
    onError: (error) => {
      toast.error(t('toasts.messageDeleteFailed'));
      console.error('Delete message error:', error);
    },
  });
}

export function useMaintenanceMode(organizationId: string, enabled = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.maintenanceMode(organizationId),
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-maintenance-mode', organizationId });
      const res = await fetch(`/api/admin?${params}`);
      if (!res.ok) throw new Error('Failed to fetch maintenance mode');
      const json = await res.json();
      return json.data as any;
    },
    enabled: enabled && !!organizationId,
  });
}

export function useEnableMaintenanceMode() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: {
      organizationId: string;
      userId: string;
      title: string;
      message: string;
      startTime: number;
      estimatedDuration?: string;
      icon?: string;
    }) => {
      const res = await fetch('/api/admin?action=enable-maintenance-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to enable maintenance mode');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.maintenanceMode(variables.organizationId),
      });
      toast.success(t('toasts.maintenanceEnabled'));
    },
    onError: (error) => {
      toast.error(t('toasts.maintenanceEnableFailed'));
      console.error('Enable maintenance error:', error);
    },
  });
}

export function useDisableMaintenanceMode() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: { organizationId: string; userId: string }) => {
      const res = await fetch('/api/admin?action=disable-maintenance-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to disable maintenance mode');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.maintenanceMode(variables.organizationId),
      });
      toast.success(t('toasts.maintenanceDisabled'));
    },
    onError: (error) => {
      toast.error(t('toasts.maintenanceDisableFailed'));
      console.error('Disable maintenance error:', error);
    },
  });
}

export function useCalendarExportData(enabled = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.calendarExportData,
    queryFn: async () => {
      const res = await fetch('/api/admin?action=get-calendar-export-data');
      if (!res.ok) throw new Error('Failed to fetch calendar data');
      const json = await res.json();
      return json.data as any[];
    },
    enabled,
  });
}

export function useCostAnalysis(period: string, enabled = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.costAnalysis(period),
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-cost-analysis', period });
      const res = await fetch(`/api/admin?${params}`);
      if (!res.ok) throw new Error('Failed to fetch cost analysis');
      const json = await res.json();
      return json.data as any;
    },
    enabled,
  });
}

export function useDetectConflicts(enabled = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.conflicts,
    queryFn: async () => {
      const res = await fetch('/api/admin?action=detect-conflicts');
      if (!res.ok) throw new Error('Failed to detect conflicts');
      const json = await res.json();
      return json.data as any[];
    },
    enabled,
  });
}

export function useSmartSuggestions(enabled = true) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.smartSuggestions,
    queryFn: async () => {
      const res = await fetch('/api/admin?action=get-smart-suggestions');
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      const json = await res.json();
      return json.data as any[];
    },
    enabled,
  });
}
