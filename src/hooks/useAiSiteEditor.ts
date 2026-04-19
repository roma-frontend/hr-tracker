import { useQuery } from '@tanstack/react-query';

const AI_SITE_EDITOR_QUERY_KEYS = {
  currentMonthUsage: (userId: string) => ['ai-site-editor', 'usage', userId],
  history: (userId: string, limit: number) => ['ai-site-editor', 'history', userId, limit],
};

async function fetchCurrentMonthUsage(userId: string) {
  const params = new URLSearchParams({ action: 'get-current-month-usage', userId });
  const res = await fetch(`/api/ai-site-editor?${params}`);
  if (!res.ok) throw new Error('Failed to fetch usage');
  const json = await res.json();
  return json.data;
}

async function fetchHistory(userId: string, limit: number) {
  const params = new URLSearchParams({ action: 'get-history', userId, limit: String(limit) });
  const res = await fetch(`/api/ai-site-editor?${params}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  const json = await res.json();
  return json.data;
}

export function useCurrentMonthUsage(userId: string) {
  return useQuery({
    queryKey: AI_SITE_EDITOR_QUERY_KEYS.currentMonthUsage(userId),
    queryFn: () => fetchCurrentMonthUsage(userId),
    enabled: !!userId,
    select: (data) =>
      data || {
        designChanges: 0,
        contentChanges: 0,
        layoutChanges: 0,
        logicChanges: 0,
        fullControlChanges: 0,
        totalRequests: 0,
      },
  });
}

export function useAiSiteEditorHistory(userId: string, limit = 10) {
  return useQuery({
    queryKey: AI_SITE_EDITOR_QUERY_KEYS.history(userId, limit),
    queryFn: () => fetchHistory(userId, limit),
    enabled: !!userId,
    select: (data) => data || [],
  });
}
