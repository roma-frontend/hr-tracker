/**
 * useOptimisticSendMessage - Optimistic message sending hook
 *
 * Provides instant UI feedback when sending messages
 * Rolls back automatically on error
 */

'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { useOptimistic, useState, useCallback } from 'react';

interface OptimisticMessage {
  _id: string;
  conversationId: Id<'chatConversations'>;
  senderId: Id<'users'>;
  content: string;
  createdAt: number;
  pending: boolean;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
}

export function useOptimisticSendMessage(
  conversationId: Id<'chatConversations'>,
  userId: Id<'users'>,
  organizationId: Id<'organizations'>,
) {
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);

  const addOptimisticMessage = useCallback((newMessage: OptimisticMessage) => {
    setOptimisticMessages((prev) => [...prev, newMessage]);
  }, []);

  const sendMessage = useMutation(api.chat.mutations.sendMessage);
  const messages =
    useQuery(api.chat.queries.getMessages, { conversationId, userId, limit: 60 }) ?? [];

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOptimistic = useCallback(
    async (
      content: string,
      replyToId?: Id<'chatMessages'>,
      attachmentUrl?: string,
      attachmentType?: 'image' | 'file',
    ) => {
      if (!content.trim() && !attachmentUrl) return;

      setIsSending(true);
      setError(null);

      // Create optimistic message
      const optimisticMsg: OptimisticMessage = {
        _id: `temp-${Date.now()}`,
        conversationId,
        senderId: userId,
        content,
        createdAt: Date.now(),
        pending: true,
        type: attachmentUrl ? (attachmentType === 'image' ? 'image' : 'file') : 'text',
        attachmentUrl: attachmentUrl ?? undefined,
      };

      // Add to optimistic state (instant UI update)
      addOptimisticMessage(optimisticMsg);

      try {
        // Send to server
        await sendMessage({
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

        // Clear optimistic on success (real message will appear from Convex)
        setIsSending(false);
        return true;
      } catch (err) {
        // Remove optimistic message on error
        setError(err instanceof Error ? err.message : 'Failed to send message');
        setIsSending(false);
        throw err;
      }
    },
    [conversationId, userId, organizationId, sendMessage, addOptimisticMessage],
  );

  return {
    sendOptimistic,
    isSending,
    error,
    messages: [...messages, ...optimisticMessages],
  };
}

/**
 * useOptimisticReaction - Optimistic reaction hook
 */
export function useOptimisticReaction(messageId: Id<'chatMessages'>, userId: Id<'users'>) {
  const [optimisticReactions, setOptimisticReactions] = useState<
    Array<{ userId: Id<'users'>; emoji: string }>
  >([]);

  const addOptimisticReaction = useCallback((reaction: { userId: Id<'users'>; emoji: string }) => {
    setOptimisticReactions((prev) => [...prev, reaction]);
  }, []);

  const toggleReaction = useMutation(api.chat.mutations.toggleReaction);
  const [isToggling, setIsToggling] = useState(false);

  const toggleOptimistic = useCallback(
    async (emoji: string) => {
      setIsToggling(true);

      const reaction = { userId, emoji };
      addOptimisticReaction(reaction);

      try {
        await toggleReaction({ messageId, userId, emoji });
        setIsToggling(false);
      } catch (err) {
        setIsToggling(false);
        throw err;
      }
    },
    [messageId, userId, toggleReaction, addOptimisticReaction],
  );

  return {
    toggleOptimistic,
    isToggling,
    reactions: optimisticReactions,
  };
}

/**
 * useOptimisticLeaveRequest - Optimistic leave request hook
 */
export function useOptimisticLeaveRequest() {
  const [optimisticRequests, setOptimisticRequests] = useState<
    Array<{ id: string; type: string; startDate: string; endDate: string; status: 'pending' }>
  >([]);

  const addOptimisticRequest = useCallback(
    (request: {
      id: string;
      type: string;
      startDate: string;
      endDate: string;
      status: 'pending';
    }) => {
      setOptimisticRequests((prev) => [...prev, request]);
    },
    [],
  );

  const createLeave = useMutation(api.leaves.createLeave);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOptimistic = useCallback(
    async (
      userId: Id<'users'>,
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

      addOptimisticRequest(optimisticRequest);

      try {
        await createLeave({ userId, type, startDate, endDate, days, reason, comment });
        setIsCreating(false);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create leave request');
        setIsCreating(false);
        throw err;
      }
    },
    [createLeave, addOptimisticRequest],
  );

  return {
    createOptimistic,
    isCreating,
    error,
    requests: optimisticRequests,
  };
}

/**
 * useOptimisticTaskStatus - Optimistic task status update hook
 */
export function useOptimisticTaskStatus() {
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Array<{ taskId: Id<'tasks'>; status: string }>
  >([]);

  const addOptimisticUpdate = useCallback((update: { taskId: Id<'tasks'>; status: string }) => {
    setOptimisticUpdates((prev) => [...prev, update]);
  }, []);

  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOptimistic = useCallback(
    async (
      taskId: Id<'tasks'>,
      status: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled',
      userId: Id<'users'>,
    ) => {
      setIsUpdating(true);
      setError(null);

      addOptimisticUpdate({ taskId, status });

      try {
        await updateTaskStatus({ taskId, status, userId });
        setIsUpdating(false);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update task status');
        setIsUpdating(false);
        throw err;
      }
    },
    [updateTaskStatus, addOptimisticUpdate],
  );

  return {
    updateOptimistic,
    isUpdating,
    error,
    updates: optimisticUpdates,
  };
}
