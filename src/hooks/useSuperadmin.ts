import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  organizationId?: string;
}

export interface ImpersonationSession {
  id: string;
  isActive: boolean;
  superadminName: string;
  targetUserName: string;
  targetUserEmail: string;
  organizationName: string;
  reason: string;
  startedAt: number;
  endedAt?: number;
  duration: number;
  targetUser?: {
    name: string;
    email: string;
  };
  expiresAt?: number;
  sessionId: string;
}

export function useSearchUsers(prefix: string) {
  return useQuery({
    queryKey: ['superadmin', 'searchUsers', prefix],
    queryFn: async () => {
      if (prefix.length < 2) return [];
      const res = await fetch(`/api/superadmin/impersonate?prefix=${encodeURIComponent(prefix)}`);
      if (!res.ok) throw new Error('Failed to search users');
      const data = await res.json();
      return data.users as UserSearchResult[];
    },
    enabled: prefix.length >= 2,
  });
}

export function useActiveImpersonation(userId: string) {
  return useQuery({
    queryKey: ['superadmin', 'activeImpersonation', userId],
    queryFn: async () => {
      const res = await fetch(`/api/superadmin/impersonate/active?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to get active session');
      const data = await res.json();
      return data.session as ImpersonationSession | null;
    },
    enabled: !!userId,
  });
}

export function useImpersonationHistory(superadminId: string, limit = 20) {
  return useQuery({
    queryKey: ['superadmin', 'impersonationHistory', superadminId, limit],
    queryFn: async () => {
      const res = await fetch(
        `/api/superadmin/impersonate/history?superadminId=${superadminId}&limit=${limit}`,
      );
      if (!res.ok) throw new Error('Failed to get history');
      const data = await res.json();
      return data.sessions as ImpersonationSession[];
    },
    enabled: !!superadminId,
  });
}

export function useStartImpersonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      superadminId,
      targetUserId,
      reason,
    }: {
      superadminId: string;
      targetUserId: string;
      reason: string;
    }) => {
      const res = await fetch('/api/superadmin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ superadminId, targetUserId, reason }),
      });
      if (!res.ok) throw new Error('Failed to start impersonation');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['superadmin', 'activeImpersonation', variables.superadminId],
      });
      queryClient.invalidateQueries({
        queryKey: ['superadmin', 'impersonationHistory', variables.superadminId],
      });
    },
  });
}

export function useEndImpersonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      userId,
    }: {
      sessionId: string;
      userId: string;
    }) => {
      const res = await fetch('/api/superadmin/impersonate', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId }),
      });
      if (!res.ok) throw new Error('Failed to end impersonation');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['superadmin', 'activeImpersonation', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['superadmin', 'impersonationHistory', variables.userId],
      });
    },
  });
}
