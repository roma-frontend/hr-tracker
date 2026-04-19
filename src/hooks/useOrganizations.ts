import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const ORG_QUERY_KEYS = {
  all: ['organizations'] as const,
  listAll: () => [...ORG_QUERY_KEYS.all, 'list-all'] as const,
  getAll: () => [...ORG_QUERY_KEYS.all, 'get-all'] as const,
  getById: (id: string) => [...ORG_QUERY_KEYS.all, 'get-by-id', id] as const,
  members: (orgId: string) => [...ORG_QUERY_KEYS.all, 'members', orgId] as const,
  search: (q: string) => [...ORG_QUERY_KEYS.all, 'search', q] as const,
  getBySlug: (slug: string) => [...ORG_QUERY_KEYS.all, 'by-slug', slug] as const,
  joinRequests: (status?: string) => [...ORG_QUERY_KEYS.all, 'join-requests', status] as const,
  myOrg: () => [...ORG_QUERY_KEYS.all, 'my-org'] as const,
  pendingCount: () => [...ORG_QUERY_KEYS.all, 'pending-count'] as const,
  forPicker: () => [...ORG_QUERY_KEYS.all, 'picker'] as const,
  validateInvite: (token: string) => [...ORG_QUERY_KEYS.all, 'validate-invite', token] as const,
};

async function fetchOrg<T>(action: string, params?: Record<string, string>): Promise<T> {
  const url = new URL('/api/org', window.location.origin);
  url.searchParams.set('action', action);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  const json = await res.json();
  return json.data;
}

async function mutateOrg<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/org?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Mutation failed' }));
    throw new Error(error.error || 'Mutation failed');
  }
  const json = await res.json();
  return json.data;
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function useListAllOrganizations(enabled = true) {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.listAll(),
    queryFn: () => fetchOrg<any[]>('list-all'),
    enabled,
  });
}

export function useAllOrganizations(isSuperadmin = false) {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.getAll(),
    queryFn: () => fetchOrg<any[]>('get-all'),
    enabled: isSuperadmin,
  });
}

export function useOrganizationById(organizationId: string, callerUserId: string) {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.getById(organizationId),
    queryFn: () =>
      fetchOrg<any>('get-by-id', { organizationId }),
    enabled: !!organizationId && !!callerUserId,
  });
}

export function useOrgMembers(
  organizationId: string,
  callerUserId: string,
  limit?: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.members(organizationId),
    queryFn: () =>
      fetchOrg<any[]>('get-members', {
        organizationId,
        superadminUserId: callerUserId,
        ...(limit ? { limit: String(limit) } : {}),
      }),
    enabled: enabled && !!callerUserId && !!organizationId,
  });
}

export function useSearchOrganizations(query: string, enabled = true) {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.search(query),
    queryFn: () => fetchOrg<any[]>('search', { q: query }),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOrganizationBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.getBySlug(slug),
    queryFn: () => fetchOrg<any>('get-by-slug', { slug }),
    enabled: enabled && !!slug,
  });
}

export function useJoinRequests(organizationId?: string | null, enabled = true) {
  return useQuery({
    queryKey: ['org', 'join-requests', organizationId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (organizationId) params.set('organizationId', organizationId);
      const res = await fetch(`/api/org-requests?${params}`);
      if (!res.ok) throw new Error('Failed to fetch join requests');
      const json = await res.json();
      return json.data as any[];
    },
    enabled: enabled && !!organizationId,
  });
}

export function useMyOrganization(enabled = true) {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.myOrg(),
    queryFn: () => fetchOrg<any>('get-my-org'),
    enabled,
  });
}

export function usePendingJoinRequestCount(enabled = true) {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.pendingCount(),
    queryFn: () => fetchOrg<number>('get-pending-count'),
    enabled,
  });
}

export function useOrganizationsForPicker(enabled = true) {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.forPicker(),
    queryFn: () => fetchOrg<any[]>('get-for-picker'),
    enabled,
  });
}

export function useValidateInviteToken(token: string, enabled = true) {
  return useQuery({
    queryKey: ORG_QUERY_KEYS.validateInvite(token),
    queryFn: () => fetchOrg<any>('validate-invite', { token }),
    enabled: enabled && !!token,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      slug: string;
      plan: 'starter' | 'professional' | 'enterprise';
      timezone?: string;
      country?: string;
      industry?: string;
    }) => mutateOrg<any>('create', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.all });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      organizationId: string;
      name?: string;
      plan?: 'starter' | 'professional' | 'enterprise';
      isActive?: boolean;
      timezone?: string;
      country?: string;
      industry?: string;
    }) => mutateOrg<any>('update', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.all });
    },
  });
}

export function useAssignOrgAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { userId: string; organizationId: string }) =>
      mutateOrg<any>('assign-admin', body),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.members(vars.organizationId) });
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.all });
    },
  });
}

export function useRemoveOrgAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { userId: string }) => mutateOrg<any>('remove-admin', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.all });
    },
  });
}

export function useRequestToJoinOrganization() {
  return useMutation({
    mutationFn: (body: {
      organizationId: string;
      requestedByEmail: string;
      requestedByName: string;
    }) => mutateOrg<any>('request-join', body),
  });
}

export function useApproveJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      inviteId: string;
      role: 'employee' | 'supervisor';
      department?: string;
      position?: string;
      passwordHash: string;
    }) => mutateOrg<any>('approve-request', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.joinRequests() });
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.pendingCount() });
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.all });
    },
  });
}

export function useRejectJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { inviteId: string; reason?: string }) =>
      mutateOrg<any>('reject-request', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.joinRequests() });
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.pendingCount() });
    },
  });
}

export function useGenerateInviteToken() {
  return useMutation({
    mutationFn: (body: { inviteEmail?: string; expiryHours?: number }) =>
      mutateOrg<{ token: string; inviteId: string; expiresAt: number }>(
        'generate-invite',
        body
      ),
  });
}

export function useRemoveMemberFromOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { userId: string }) =>
      mutateOrg<any>('remove-member', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.all });
    },
  });
}

export function useAssignUserAsOrgAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { userEmail: string; organizationId: string }) =>
      mutateOrg<any>('assign-user-as-admin', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORG_QUERY_KEYS.members('') });
    },
  });
}

export function useRequestJoinOrganization() {
  return useMutation({
    mutationFn: (body: {
      userId: string;
      organizationId: string;
    }) => mutateOrg<any>('request-join', body),
  });
}
