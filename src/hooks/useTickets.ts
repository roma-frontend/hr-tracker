import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  createdBy: string;
  creatorName: string;
  organizationId?: string;
  organizationName?: string;
  assignedTo?: string;
  chatId?: string;
  chatActivated?: boolean;
  isOverdue: boolean;
  createdAt: number;
  updatedAt: number;
  comments?: TicketComment[];
  commentCount?: number;
}

export interface TicketComment {
  id: string;
  message: string;
  isInternal: boolean;
  authorId: string;
  authorName: string;
  createdAt: number;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  waitingCustomer: number;
  resolved: number;
  closed: number;
  critical: number;
  overdue: number;
  avgResponseTime: number;
}

export interface TicketChatStatus {
  hasChat: boolean;
  chatId?: string;
  chatActivated: boolean;
}

export function useAllTickets() {
  return useQuery({
    queryKey: ['tickets', 'all'],
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-all-tickets' });
      const res = await fetch(`/api/tickets?${params}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const json = await res.json();
      return json.data as Ticket[];
    },
  });
}

export function useTicketStats() {
  return useQuery({
    queryKey: ['tickets', 'stats'],
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-ticket-stats' });
      const res = await fetch(`/api/tickets?${params}`);
      if (!res.ok) throw new Error('Failed to fetch ticket stats');
      const json = await res.json();
      return json.data as TicketStats;
    },
  });
}

export function useTicketById(ticketId: string | null) {
  return useQuery({
    queryKey: ['tickets', ticketId],
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-ticket-by-id', ticketId: ticketId ?? '' });
      const res = await fetch(`/api/tickets?${params}`);
      if (!res.ok) throw new Error('Failed to fetch ticket');
      const json = await res.json();
      return json.data as Ticket;
    },
    enabled: !!ticketId,
  });
}

export function useTicketChatStatus(ticketId: string | null) {
  return useQuery({
    queryKey: ['tickets', 'chat-status', ticketId],
    queryFn: async () => {
      const params = new URLSearchParams({ action: 'get-ticket-chat-status', ticketId: ticketId ?? '' });
      const res = await fetch(`/api/tickets?${params}`);
      if (!res.ok) throw new Error('Failed to fetch chat status');
      const json = await res.json();
      return json.data as TicketChatStatus;
    },
    enabled: !!ticketId,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      organizationId?: string;
      createdBy: string;
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      category: 'technical' | 'billing' | 'access' | 'feature_request' | 'bug' | 'other';
    }) => {
      const params = new URLSearchParams({ action: 'create-ticket' });
      const res = await fetch(`/api/tickets?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create ticket');
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { ticketId: string; status: string; userId: string }) => {
      const params = new URLSearchParams({ action: 'update-ticket-status' });
      const res = await fetch(`/api/tickets?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update ticket status');
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { ticketId: string; assignedTo: string }) => {
      const params = new URLSearchParams({ action: 'assign-ticket' });
      const res = await fetch(`/api/tickets?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to assign ticket');
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useAddTicketComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      ticketId: string;
      authorId: string;
      message: string;
      isInternal: boolean;
    }) => {
      const params = new URLSearchParams({ action: 'add-ticket-comment' });
      const res = await fetch(`/api/tickets?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      const json = await res.json();
      return json.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.ticketId] });
    },
  });
}

export function useResolveTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { ticketId: string; resolution: string; userId: string }) => {
      const params = new URLSearchParams({ action: 'resolve-ticket' });
      const res = await fetch(`/api/tickets?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to resolve ticket');
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useCreateTicketChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { ticketId: string; superadminId: string }) => {
      const params = new URLSearchParams({ action: 'create-ticket-chat' });
      const res = await fetch(`/api/tickets?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create chat');
      const json = await res.json();
      return json.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', 'chat-status', variables.ticketId] });
    },
  });
}

export function useActivateTicketChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { ticketId: string; superadminId: string; message: string }) => {
      const params = new URLSearchParams({ action: 'activate-ticket-chat' });
      const res = await fetch(`/api/tickets?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to activate chat');
      const json = await res.json();
      return json.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', 'chat-status', variables.ticketId] });
    },
  });
}
