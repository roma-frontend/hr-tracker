import { useMutation } from '@tanstack/react-query';

async function mutateOrgRequests<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/org-requests?action=${action}`, {
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

export function useRequestOrganization() {
  return useMutation({
    mutationFn: (body: {
      name: string;
      slug: string;
      email: string;
      password: string;
      userName: string;
      phone?: string;
      plan: 'professional' | 'enterprise';
      country?: string;
      industry?: string;
      teamSize?: string;
      description?: string;
    }) => mutateOrgRequests<any>('request-org', body),
  });
}

export function useCreateStarterOrganization() {
  return useMutation({
    mutationFn: (body: {
      name: string;
      slug: string;
      email: string;
      password: string;
      userName: string;
      phone?: string;
      country?: string;
      industry?: string;
    }) => mutateOrgRequests<any>('create-starter-org', body),
  });
}

export function useApproveOrgRequest() {
  return useMutation({
    mutationFn: (body: { requestId: string }) =>
      mutateOrgRequests<any>('approve', body),
  });
}

export function useRejectOrgRequest() {
  return useMutation({
    mutationFn: (body: { requestId: string; reason?: string }) =>
      mutateOrgRequests<any>('reject', body),
  });
}
