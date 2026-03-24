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
  conversationId: Id<"chatConversations">;
  senderId: Id<"users">;
  content: string;
  createdAt: number;
  pending: boolean;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
}

export function useOptimisticSendMessage(
  conversationId: Id<"chatConversations">,
  userId: Id<"users">,
  organizationId: Id<"organizations">
) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic<OptimisticMessage[]>(
    [],
    (state, newMessage: OptimisticMessage) => [...state, newMessage]
  );

  const sendMessage = useMutation(api.chat.sendMessage);
  const messages = useQuery(api.chat.getMessages, { conversationId, userId, limit: 60 }) ?? [];

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOptimistic = useCallback(async (
    content: string,
    replyTo?: Id<"chatMessages">,
    attachmentUrl?: string,
    attachmentType?: 'image' | 'file'
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
      attachmentUrl,
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
        replyTo,
        attachmentUrl,
        attachmentType: attachmentType as any,
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
  }, [conversationId, userId, organizationId, sendMessage, addOptimisticMessage]);

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
export function useOptimisticReaction(
  messageId: Id<"chatMessages">,
  userId: Id<"users">
) {
  const [optimisticReactions, addOptimisticReaction] = useOptimistic<
    Array<{ userId: Id<"users">; emoji: string }>
  >([], (state, reaction) => [...state, reaction]);

  const toggleReaction = useMutation(api.chat.toggleReaction);
  const [isToggling, setIsToggling] = useState(false);

  const toggleOptimistic = useCallback(async (emoji: string) => {
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
  }, [messageId, userId, toggleReaction, addOptimisticReaction]);

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
  const [optimisticRequests, addOptimisticRequest] = useOptimistic<
    Array<{ id: string; type: string; startDate: string; endDate: string; status: 'pending' }>
  >([], (state, request) => [...state, request]);

  const createLeave = useMutation(api.leaves.createLeave);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOptimistic = useCallback(async (
    userId: Id<"users">,
    type: 'paid' | 'unpaid' | 'sick' | 'family' | 'doctor',
    startDate: string,
    endDate: string,
    days: number,
    reason: string,
    comment?: string
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
  }, [createLeave, addOptimisticRequest]);

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
  const [optimisticUpdates, addOptimisticUpdate] = useOptimistic<
    Array<{ taskId: Id<"tasks">; status: string }>
  >([], (state, update) => [...state, update]);

  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOptimistic = useCallback(async (
    taskId: Id<"tasks">,
    status: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled',
    userId: Id<"users">
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
  }, [updateTaskStatus, addOptimisticUpdate]);

  return {
    updateOptimistic,
    isUpdating,
    error,
    updates: optimisticUpdates,
  };
}
