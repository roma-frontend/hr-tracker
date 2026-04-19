import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface OrganizationRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedName: string;
  requestedSlug: string;
  requestedPlan: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  industry?: string;
  teamSize?: string;
  country?: string;
  description?: string;
  rejectionReason?: string;
  createdAt: number;
  reviewedBy?: string;
  reviewedAt?: number;
}

export function useOrgRequests(statusFilter?: string, enabled = true) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const status = statusFilter || 'all';

  return useQuery({
    queryKey: ['org-requests', status, user?.id],
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-all' });
      if (status && status !== 'all') {
        params.set('status', status);
      }
      const res = await fetch(`/api/org-requests?${params}`);
      if (!res.ok) throw new Error(t('orgRequests.fetchFailed'));
      const json = await res.json();
      return json.data as OrganizationRequest[];
    },
    enabled: enabled && !!user?.id && ['admin', 'superadmin'].includes(user?.role || ''),
  });
}

export function useApproveOrgRequest() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch('/api/org-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', requestId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t('orgRequests.approveFailed'));
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-requests'] });
      toast.success(t('orgRequests.approved', t('orgRequests.approved')));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('orgRequests.approveFailed', t('orgRequests.approveFailed')));
    },
  });
}

export function useRejectOrgRequest() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      const res = await fetch('/api/org-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', requestId, reason }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t('orgRequests.rejectFailed'));
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-requests'] });
      toast.success(t('orgRequests.rejected', t('orgRequests.rejected')));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('orgRequests.rejectFailed', t('orgRequests.rejectFailed')));
    },
  });
}
