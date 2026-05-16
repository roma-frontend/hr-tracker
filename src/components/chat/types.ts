import type { Id } from '@/../convex/_generated/dataModel';

// ─── Message Types ───────────────────────────────────────────────────────────

export interface ChatAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface ChatPollOption {
  id: string;
  text: string;
  votes: Id<'users'>[];
}

export interface ChatPoll {
  question: string;
  options: ChatPollOption[];
  closedAt?: number;
}

export interface ChatMessage {
  _id: Id<'chatMessages'> | string;
  _creationTime?: number;
  conversationId: Id<'chatConversations'>;
  senderId: Id<'users'>;
  type: 'text' | 'image' | 'file' | 'audio' | 'system' | 'call';
  content: string;
  attachments?: ChatAttachment[];
  replyToId?: Id<'chatMessages'>;
  replyToContent?: string;
  replyToSenderName?: string;
  reactions?: Record<string, Id<'users'>[]>;
  mentionedUserIds?: Id<'users'>[];
  readBy?: Array<{ userId: Id<'users'>; readAt: number }>;
  poll?: ChatPoll;
  audioDuration?: number;
  isEdited?: boolean;
  editedAt?: number;
  isDeleted?: boolean;
  deletedAt?: number;
  threadCount?: number;
  createdAt: number;
  // Enriched fields from queries
  sender?: { _id: Id<'users'>; name: string; avatarUrl?: string } | null;
  pending?: boolean;
  isServiceBroadcast?: boolean;
}

// ─── Conversation Types ──────────────────────────────────────────────────────

export interface ChatConversationOtherUser {
  _id: Id<'users'>;
  name: string;
  avatarUrl?: string;
  presenceStatus?: string;
}

export interface ChatConversationMemberInfo {
  userId: Id<'users'>;
  user: { name: string; avatarUrl?: string } | null;
}

export interface ChatConversation {
  _id: Id<'chatConversations'>;
  _creationTime?: number;
  organizationId?: Id<'organizations'>;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  avatarUrl?: string;
  createdBy: Id<'users'>;
  lastMessageAt?: number;
  lastMessageText?: string;
  lastMessageSenderId?: Id<'users'>;
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  createdAt: number;
  updatedAt?: number;
  // Enriched
  otherUser?: ChatConversationOtherUser | null;
  memberCount?: number;
  members?: ChatConversationMemberInfo[];
  membership?: ChatMembership;
}

// ─── Member Types ────────────────────────────────────────────────────────────

export interface ChatMembership {
  _id: Id<'chatMembers'>;
  conversationId: Id<'chatConversations'>;
  userId: Id<'users'>;
  role: 'owner' | 'admin' | 'member';
  unreadCount: number;
  lastReadAt?: number;
  isMuted: boolean;
  isDeleted?: boolean;
  isArchived?: boolean;
  joinedAt: number;
}

export interface ChatMember {
  _id: Id<'chatMembers'>;
  userId: Id<'users'>;
  role: 'owner' | 'admin' | 'member';
  joinedAt: number;
  user: {
    _id: Id<'users'>;
    name: string;
    email: string;
    avatarUrl?: string;
    presenceStatus?: string;
    department?: string;
    position?: string;
    isOnLeave?: boolean;
  } | null;
}

// ─── Typing / Presence ───────────────────────────────────────────────────────

export interface TypingUser {
  userId: Id<'users'>;
  name: string;
}

// ─── Mention Suggestion ──────────────────────────────────────────────────────

export interface MentionSuggestion {
  _id: Id<'users'>;
  name: string;
  avatarUrl?: string;
}
