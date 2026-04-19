import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface LoginAttempt {
  id: string;
  userid: string;
  success: boolean;
  method: string;
  ip?: string;
  city?: string;
  country?: string;
  riskScore?: number;
  riskFactors?: string[];
  userAgent?: string;
  createdAt: number;
}

export interface SecuritySetting {
  id: string;
  key: string;
  enabled: boolean;
  description?: string;
  updatedAt?: number;
  updatedBy?: string;
}

export interface SuspendedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_suspended: boolean;
  suspended_until: number | null;
  suspended_reason: string | null;
  suspended_by: string | null;
  suspended_at: number | null;
}

export function useLoginAttemptsByUser(userId: string, limit = 10) {
  return useQuery({
    queryKey: ['security', 'login-attempts', userId, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'get-login-attempts-by-user',
        userId,
        limit: String(limit),
      });
      const res = await fetch(`/api/security/login-attempts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch login attempts');
      const json = await res.json();
      return json.data as LoginAttempt[];
    },
    enabled: !!userId,
  });
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: ['security', 'settings'],
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-settings' });
      const res = await fetch(`/api/security?${params}`);
      if (!res.ok) throw new Error('Failed to fetch security settings');
      const json = await res.json();
      return json.data as SecuritySetting[];
    },
  });
}

export function useLoginStats() {
  return useQuery({
    queryKey: ['security', 'login-stats'],
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-login-stats' });
      const res = await fetch(`/api/security?${params}`);
      if (!res.ok) throw new Error('Failed to fetch login stats');
      const json = await res.json();
      return json.data as { failed: number; highRisk: number; total?: number; suspicious?: number };
    },
  });
}

export function useAuditLogs(limit = 50) {
  return useQuery({
    queryKey: ['security', 'audit-logs', limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'get-audit-logs',
        limit: String(limit),
      });
      const res = await fetch(`/api/security?${params}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const json = await res.json();
      return json.data as any[];
    },
  });
}

export function useSuspendedUsers() {
  return useQuery({
    queryKey: ['security', 'suspended-users'],
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-suspended-users' });
      const res = await fetch(`/api/security?${params}`);
      if (!res.ok) throw new Error('Failed to fetch suspended users');
      const json = await res.json();
      return json.data as SuspendedUser[];
    },
  });
}

export function useToggleSecuritySetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { key: string; enabled: boolean; updatedBy: string }) => {
      const res = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-setting', ...data }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to toggle setting');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'settings'] });
    },
  });
}
