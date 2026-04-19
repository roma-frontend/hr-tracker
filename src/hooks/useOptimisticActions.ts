'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { useSendMessage, useToggleReaction } from '@/hooks/useChat';
import { useCreateLeave } from '@/hooks/useLeaves';
import { useUpdateTask } from '@/hooks/useTasks';

interface OptimisticMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: number;
  pending: boolean;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
}

export function useOptimisticSendMessage(
  conversationId: string,
  userId: string,
  organizationId: string,
) {
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'get-messages',
        conversationId,
        userId,
        limit: '60',
      });
      const res = await fetch(`/api/chat?${params}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!conversationId && !!userId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: {
      conversationId: string;
      senderId: string;
      organizationId: string;
      content: string;
      replyToId?: string;
      type: 'text' | 'image' | 'file';
      attachments?: Array<{ url: string; name: string; type: string; size: number }>;
    }) => {
      const res = await fetch('/api/chat?action=send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations', userId, organizationId] });
    },
  });

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOptimistic = useCallback(
    async (
      content: string,
      replyToId?: string,
      attachmentUrl?: string,
      attachmentType?: 'image' | 'file',
    ) => {
      if (!content.trim() && !attachmentUrl) return;

      setIsSending(true);
      setError(null);

      const optimisticMsg: OptimisticMessage = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: userId,
        content,
        createdAt: Date.now(),
        pending: true,
        type: attachmentUrl ? (attachmentType === 'image' ? 'image' : 'file') : 'text',
        attachmentUrl: attachmentUrl ?? undefined,
      };

      setOptimisticMessages((prev) => [...prev, optimisticMsg]);

      try {
        await sendMessageMutation.mutateAsync({
          conversationId,
          senderId: userId,
          organizationId,
          content,
          replyToId,
          type: attachmentUrl ? (attachmentType === 'image' ? 'image' : 'file') : 'text',
          attachments: attachmentUrl
            ? [{ url: attachmentUrl, name: 'attachment', type: attachmentType || 'file', size: 0 }]
            : undefined,
        });

        setIsSending(false);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        setIsSending(false);
        throw err;
      }
    },
    [conversationId, userId, organizationId, sendMessageMutation],
  );

  return {
    sendOptimistic,
    isSending,
    error,
    messages: [...messages, ...optimisticMessages],
  };
}

export function useOptimisticReaction(messageId: string, userId: string) {
  const [optimisticReactions, setOptimisticReactions] = useState<
    Array<{ userId: string; emoji: string }>
  >([]);
  const queryClient = useQueryClient();

  const toggleReactionMutation = useMutation({
    mutationFn: async (data: { messageId: string; userId: string; emoji: string }) => {
      const res = await fetch('/api/chat?action=react-to-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to toggle reaction');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
  });

  const [isToggling, setIsToggling] = useState(false);

  const toggleOptimistic = useCallback(
    async (emoji: string) => {
      setIsToggling(true);

      const reaction = { userId, emoji };
      setOptimisticReactions((prev) => [...prev, reaction]);

      try {
        await toggleReactionMutation.mutateAsync({ messageId, userId, emoji });
        setIsToggling(false);
      } catch (err) {
        setIsToggling(false);
        throw err;
      }
    },
    [messageId, userId, toggleReactionMutation],
  );

  return {
    toggleOptimistic,
    isToggling,
    reactions: optimisticReactions,
  };
}

export function useOptimisticLeaveRequest() {
  const [optimisticRequests, setOptimisticRequests] = useState<
    Array<{ id: string; type: string; startDate: string; endDate: string; status: 'pending' }>
  >([]);
  const queryClient = useQueryClient();

  const createLeaveMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      organizationId: string;
      leaveType: string;
      startDate: string;
      endDate: string;
      reason: string;
      comment?: string;
    }) => {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create leave request');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
  });

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOptimistic = useCallback(
    async (
      userId: string,
      type: 'paid' | 'unpaid' | 'sick' | 'family' | 'doctor',
      startDate: string,
      endDate: string,
      days: number,
      reason: string,
      comment?: string,
    ) => {
      setIsCreating(true);
      setError(null);

      const optimisticRequest = {
        id: `temp-${Date.now()}`,
        type,
        startDate,
        endDate,
        status: 'pending' as const,
      };

      setOptimisticRequests((prev) => [...prev, optimisticRequest]);

      try {
        await createLeaveMutation.mutateAsync({
          userId,
          organizationId: '',
          leaveType: type,
          startDate,
          endDate,
          reason,
          comment,
        });
        setIsCreating(false);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create leave request');
        setIsCreating(false);
        throw err;
      }
    },
    [createLeaveMutation],
  );

  return {
    createOptimistic,
    isCreating,
    error,
    requests: optimisticRequests,
  };
}

export function useOptimisticTaskStatus() {
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Array<{ taskId: string; status: string }>
  >([]);
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async (data: { taskId: string; status: string; userId: string }) => {
      const res = await fetch('/api/tasks?action=update-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOptimistic = useCallback(
    async (
      taskId: string,
      status: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled',
      userId: string,
    ) => {
      setIsUpdating(true);
      setError(null);

      setOptimisticUpdates((prev) => [...prev, { taskId, status }]);

      try {
        await updateTaskMutation.mutateAsync({ taskId, status, userId });
        setIsUpdating(false);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update task status');
        setIsUpdating(false);
        throw err;
      }
    },
    [updateTaskMutation],
  );

  return {
    updateOptimistic,
    isUpdating,
    error,
    updates: optimisticUpdates,
  };
}
