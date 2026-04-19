import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface ChatUser {
  id: string;
  name: string;
  avatarUrl?: string;
  department?: string;
  position?: string;
  presenceStatus?: string;
  organizationId?: string;
}

export interface ChatMember {
  userId: string;
  user?: ChatUser | null;
  role?: string;
  unreadCount?: number;
  isMuted?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
}

export interface ChatConversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatarUrl?: string;
  lastMessageAt?: number;
  lastMessageText?: string;
  lastMessageSenderId?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  membership: {
    unreadCount: number;
    isMuted: boolean;
    isDeleted?: boolean;
    isArchived?: boolean;
  };
  otherUser?: ChatUser | null;
  memberCount?: number;
  members?: ChatMember[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  type: string;
  content: string;
  createdAt: number;
  isEdited?: boolean;
  isDeleted?: boolean;
  isPinned?: boolean;
  isServiceBroadcast?: boolean;
  broadcastIcon?: string;
  broadcastTitle?: string;
  replyToContent?: string;
  replyToSenderName?: string;
  reactions?: Record<string, string[]>;
  attachments?: Array<{ url: string; name: string; type: string; size: number }>;
  readBy?: Array<{ userId: string; readAt: number }>;
  poll?: {
    question: string;
    options: Array<{ id: string; text: string; votes: string[] }>;
    closedAt?: number;
  };
  threadCount?: number;
  threadLastAt?: number;
  linkPreview?: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  };
  callType?: string;
  callStatus?: string;
  callDuration?: number;
  sender?: ChatUser | null;
}

export function useChatConversations(userId: string, organizationId?: string) {
  return useQuery({
    queryKey: ['chat-conversations', userId, organizationId],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'get-my-conversations',
        userId,
        organizationId: organizationId || '',
      });
      const res = await fetch(`/api/chat?${params}`);
      if (!res.ok) throw new Error(t('chat.fetchConversationsFailed'));
      const json = await res.json();
      return json.data as ChatConversation[];
    },
    enabled: !!userId,
    refetchInterval: 10000,
  });
}

export function useChatMessages(conversationId: string, userId: string, limit = 200) {
  return useQuery({
    queryKey: ['chat-messages', conversationId, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'get-messages',
        conversationId,
        userId,
        limit: limit.toString(),
      });
      const res = await fetch(`/api/chat?${params}`);
      if (!res.ok) throw new Error(t('chat.fetchMessagesFailed'));
      const json = await res.json();
      return json.data as ChatMessage[];
    },
    enabled: !!conversationId && !!userId,
    refetchInterval: 5000,
  });
}

export function useChatMembers(conversationId: string) {
  return useQuery({
    queryKey: ['chat-members', conversationId],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'get-conversation-members',
        conversationId,
      });
      const res = await fetch(`/api/chat?${params}`);
      if (!res.ok) throw new Error(t('chat.fetchMembersFailed'));
      const json = await res.json();
      return json.data as ChatMember[];
    },
    enabled: !!conversationId,
  });
}

export function usePinnedMessages(conversationId: string) {
  const { t } = useTranslation();
  return useQuery({
    queryKey: ['chat-pinned-messages', conversationId],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'get-pinned-messages',
        conversationId,
      });
      const res = await fetch(`/api/chat?${params}`);
      if (!res.ok) throw new Error(t('chat.fetchPinnedFailed'));
      const json = await res.json();
      return json.data as ChatMessage[];
    },
    enabled: !!conversationId,
  });
}

export function useTypingUsers(conversationId: string, currentUserId: string) {
  const { t } = useTranslation();
  return useQuery({
    queryKey: ['chat-typing', conversationId, currentUserId],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'get-typing-users',
        conversationId,
        currentUserId,
      });
      const res = await fetch(`/api/chat?${params}`);
      if (!res.ok) throw new Error(t('chat.fetchTypingFailed'));
      const json = await res.json();
      return json.data as ChatUser[];
    },
    enabled: !!conversationId && !!currentUserId,
    refetchInterval: 3000,
  });
}

export function useThreadReplies(parentMessageId: string) {
  const { t } = useTranslation();
  return useQuery({
    queryKey: ['chat-thread-replies', parentMessageId],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'get-thread-replies',
        parentMessageId,
      });
      const res = await fetch(`/api/chat?${params}`);
      if (!res.ok) throw new Error(t('chat.fetchThreadFailed'));
      const json = await res.json();
      return json.data as ChatMessage[];
    },
    enabled: !!parentMessageId,
  });
}

export function useSearchMessages(conversationId: string, userId: string, query: string) {
  const { t } = useTranslation();
  return useQuery({
    queryKey: ['chat-search-messages', conversationId, query],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'search-messages',
        conversationId,
        userId,
        query,
      });
      const res = await fetch(`/api/chat?${params}`);
      if (!res.ok) throw new Error(t('chat.searchFailed'));
      const json = await res.json();
      return json.data as ChatMessage[];
    },
    enabled: !!conversationId && !!userId && query.length > 1,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: {
      conversationId: string;
      senderId: string;
      organizationId?: string;
      type: string;
      content: string;
      attachments?: Array<{ url: string; name: string; type: string; size: number }>;
      replyToId?: string;
      mentionedUserIds?: string[];
      audioDuration?: number;
      poll?: any;
    }) => {
      const res = await fetch('/api/chat?action=send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t('chat.sendMessageFailed'));
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
    onError: (error) => {
      toast.error(t('chat.sendMessageFailed', t('chat.sendMessageFailed')));
      console.error('Send message error:', error);
    },
  });
}

export function useMarkAsRead() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (data: { conversationId: string; userId: string }) => {
      const res = await fetch('/api/chat?action=mark-as-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.markReadFailed'));
      return res.json();
    },
  });
}

export function useSetTyping() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (data: {
      conversationId: string;
      userId: string;
      organizationId?: string;
      isTyping: boolean;
    }) => {
      const res = await fetch('/api/chat?action=set-typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.setTypingFailed'));
      return res.json();
    },
  });
}

export function useToggleReaction() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { messageId: string; userId: string; emoji: string }) => {
      const res = await fetch('/api/chat?action=react-to-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.reactionFailed'));
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
  });
}

export function useEditMessage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { messageId: string; userId: string; content: string }) => {
      const res = await fetch('/api/chat?action=edit-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.editMessageFailed'));
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
  });
}

export function useDeleteMessage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { messageId: string; userId: string }) => {
      const res = await fetch('/api/chat?action=delete-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.deleteMessageFailed'));
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
  });
}

export function useDeleteMessageForMe() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { messageId: string; userId: string }) => {
      const res = await fetch('/api/chat?action=delete-message-for-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.deleteForMeFailed'));
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
  });
}

export function usePinMessage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { messageId: string; userId: string; pin: boolean }) => {
      const action = data.pin ? 'pin-message' : 'unpin-message';
      const res = await fetch(`/api/chat?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.pinFailed'));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-pinned-messages'] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
  });
}

export function useVotePoll() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { messageId: string; userId: string; optionId: string }) => {
      const res = await fetch('/api/chat?action=vote-poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.voteFailed'));
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
  });
}

export function useClosePoll() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { messageId: string; userId: string }) => {
      const res = await fetch('/api/chat?action=close-poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.closePollFailed'));
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
  });
}

export function useSendThreadReply() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      parentMessageId: string;
      conversationId: string;
      senderId: string;
      organizationId?: string;
      content: string;
    }) => {
      const res = await fetch('/api/chat?action=send-thread-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.threadReplyFailed'));
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-thread-replies', variables.parentMessageId] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
  });
}

export function useScheduleMessage() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (data: {
      conversationId: string;
      senderId: string;
      organizationId?: string;
      content: string;
      scheduledFor: number;
    }) => {
      const res = await fetch('/api/chat?action=schedule-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.scheduleFailed'));
      return res.json();
    },
  });
}

export function useTogglePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { conversationId: string; userId: string }) => {
      const res = await fetch('/api/chat?action=toggle-pin-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.togglePinFailed'));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });
}

export function useDeleteConversation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { conversationId: string; userId: string }) => {
      const res = await fetch('/api/chat?action=delete-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.deleteConversationFailed'));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });
}

export function useRestoreConversation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { conversationId: string; userId: string }) => {
      const res = await fetch('/api/chat?action=restore-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.restoreConversationFailed'));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });
}

export function useToggleArchive() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { conversationId: string; userId: string }) => {
      const res = await fetch('/api/chat?action=toggle-archive-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.toggleArchiveFailed'));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });
}

export function useToggleMute() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { conversationId: string; userId: string }) => {
      const res = await fetch('/api/chat?action=toggle-mute-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.toggleMuteFailed'));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });
}

export function useCreateGroup() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (data: {
      organizationId: string;
      createdBy: string;
      name: string;
      memberIds: string[];
    }) => {
      const res = await fetch('/api/chat?action=create-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.createGroupFailed'));
      return res.json();
    },
  });
}

export function useGetOrCreateDM() {
  return useMutation({
    mutationFn: async (data: {
      organizationId: string;
      currentUserId: string;
      targetUserId: string;
    }) => {
      const res = await fetch('/api/chat?action=get-or-create-dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t('chat.getOrCreateDmFailed'));
      return res.json();
    },
  });
}

export function useTotalUnreadCount(userId?: string, organizationId?: string) {
  const { t } = useTranslation();
  return useQuery({
    queryKey: ['chat-total-unread', userId, organizationId],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'get-total-unread',
        userId: userId || '',
        organizationId: organizationId || '',
      });
      const res = await fetch(`/api/chat?${params}`);
      if (!res.ok) throw new Error(t('chat.fetchUnreadFailed'));
      const json = await res.json();
      return json.data?.totalUnread || 0;
    },
    enabled: !!userId && !!organizationId,
  });
}
