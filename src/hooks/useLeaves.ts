import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const LEAVES_QUERY_KEYS = {
  all: ['leaves'],
  byRequester: (requesterId: string) => ['leaves', 'requester', requesterId],
  byOrganization: (organizationId: string) => ['leaves', 'org', organizationId],
  byStatus: (status: string) => ['leaves', 'status', status],
  unreadCount: (requesterId: string) => ['leaves', 'unreadCount', requesterId],
};

async function fetchLeaves(params?: {
  requesterId?: string;
  organizationId?: string;
  status?: string;
  unreadOnly?: boolean;
}) {
  const searchParams = new URLSearchParams();
  if (params?.requesterId) searchParams.set('requesterId', params.requesterId);
  if (params?.organizationId) searchParams.set('organizationId', params.organizationId);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.unreadOnly) searchParams.set('unreadOnly', 'true');

  const response = await fetch(`/api/leaves?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch leaves');
  return response.json();
}

export function useLeaves(params?: {
  requesterId?: string;
  organizationId?: string;
  status?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: params?.organizationId
      ? LEAVES_QUERY_KEYS.byOrganization(params.organizationId)
      : params?.requesterId
        ? LEAVES_QUERY_KEYS.byRequester(params.requesterId)
        : LEAVES_QUERY_KEYS.all,
    queryFn: () => fetchLeaves(params),
    enabled: params?.enabled ?? true,
    select: (data) => data.leaves || [],
  });
}

export function useUnreadLeavesCount(requesterId?: string) {
  return useQuery({
    queryKey: LEAVES_QUERY_KEYS.unreadCount(requesterId || ''),
    queryFn: () => fetchLeaves({ requesterId, unreadOnly: true }),
    enabled: !!requesterId,
    select: (data) => (data.leaves || []).length,
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      organizationId: string;
      leaveType: string;
      startDate: string;
      endDate: string;
      reason?: string;
      isHalfDay?: boolean;
      halfDayPeriod?: string;
    }) => {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create leave');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVES_QUERY_KEYS.all });
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      leaveId: string;
      reviewedBy: string;
      comment?: string;
    }) => {
      const response = await fetch('/api/leaves', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId: data.leaveId,
          status: 'approved',
          reviewedBy: data.reviewedBy,
          isRead: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to approve leave');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVES_QUERY_KEYS.all });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      leaveId: string;
      reviewedBy: string;
      comment?: string;
    }) => {
      const response = await fetch('/api/leaves', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId: data.leaveId,
          status: 'rejected',
          reviewedBy: data.reviewedBy,
          isRead: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to reject leave');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVES_QUERY_KEYS.all });
    },
  });
}

export function useDeleteLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveId: string) => {
      const response = await fetch(`/api/leaves?leaveId=${leaveId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete leave');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVES_QUERY_KEYS.all });
    },
  });
}

export function useMarkLeaveAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveId: string) => {
      const response = await fetch('/api/leaves', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId,
          isRead: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to mark leave as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVES_QUERY_KEYS.all });
    },
  });
}

const DRIVER_SCHEDULES_QUERY_KEYS = {
  all: ['driver-schedules'],
  byOrganization: (organizationId: string, startTime: number, endTime: number) => [
    'driver-schedules',
    organizationId,
    startTime,
    endTime,
  ],
};

async function fetchDriverSchedules(params: {
  organizationId: string;
  startTime: number;
  endTime: number;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set('organizationId', params.organizationId);
  searchParams.set('startTime', params.startTime.toString());
  searchParams.set('endTime', params.endTime.toString());

  const response = await fetch(`/api/driver-schedules?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch driver schedules');
  return response.json();
}

export function useDriverSchedules(params: {
  organizationId: string;
  startTime: number;
  endTime: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: DRIVER_SCHEDULES_QUERY_KEYS.byOrganization(
      params.organizationId,
      params.startTime,
      params.endTime,
    ),
    queryFn: () => fetchDriverSchedules(params),
    enabled: params.enabled ?? true,
    select: (data) => data.schedules || [],
  });
}
