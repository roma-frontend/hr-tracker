"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Loader2, CheckCircle, AlertCircle, Calendar, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

interface BookingState {
  status: 'pending' | 'booked' | 'conflict' | 'loading';
  result?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: AnyAction[];
  bookingStates?: Record<number, BookingState>;
  suggestions?: string[];
}

interface BookLeaveAction {
  type: 'BOOK_LEAVE';
  leaveType: 'paid' | 'sick' | 'family' | 'unpaid' | 'doctor';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
}

interface EditLeaveAction {
  type: 'EDIT_LEAVE';
  leaveId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  leaveType: string;
}

interface DeleteLeaveAction {
  type: 'DELETE_LEAVE';
  leaveId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
}

type AnyAction = BookLeaveAction | EditLeaveAction | DeleteLeaveAction;

function parseActions(content: string): { cleanContent: string; actions: AnyAction[] } {
  const actionMatches = [...content.matchAll(/<ACTION>([\s\S]*?)<\/ACTION>/g)];
  if (actionMatches.length === 0) return { cleanContent: content, actions: [] };

  const actions: AnyAction[] = [];
  for (const match of actionMatches) {
    try {
      const action = JSON.parse(match[1].trim()) as AnyAction;
      actions.push(action);
    } catch {
      // skip invalid JSON
    }
  }

  const cleanContent = content.replace(/<ACTION>[\s\S]*?<\/ACTION>/g, '').replace(/\s{2,}/g, ' ').trim();
  return { cleanContent, actions };
}

// Generate follow-up suggestions based on assistant response content
function getFollowUpSuggestions(content: string, userRole: string): string[] {
  const lower = content.toLowerCase();

  if (lower.includes('book') || lower.includes('leave request') || lower.includes('submitted') || lower.includes('approved')) {
    return ['📋 Show my leave balance', '📅 View my upcoming leaves', '👥 Who else is on leave this week?'];
  }
  if (lower.includes('balance') || lower.includes('days left') || lower.includes('remaining')) {
    return ['📆 Book a vacation', '🤒 Request sick leave', '📊 Show my leave history'];
  }
  if (lower.includes('sick') || lower.includes('doctor') || lower.includes('medical')) {
    return ['🤒 Book sick leave for today', '👨‍⚕️ Book a doctor visit', '📋 Show my leave balance'];
  }
  if (lower.includes('team') || lower.includes('colleague') || lower.includes('who is')) {
    return ['📅 Show team calendar', '📋 My leave balance', '📆 Book time off'];
  }
  if (lower.includes('cancel') || lower.includes('delete') || lower.includes('removed')) {
    return ['📋 Show my pending leaves', '📆 Book new leave', '📊 My leave balance'];
  }
  if (userRole === 'admin' || userRole === 'supervisor') {
    return ['👥 Who is on leave today?', '📊 Show team statistics', '📅 View pending approvals'];
  }
  return ['📆 Book a vacation', '📋 Show my leave balance', '👥 Who is on leave this week?'];
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  paid: '🏖️ Paid Leave',
  sick: '🤒 Sick Leave',
  family: '👨‍👩‍👧 Family Leave',
  unpaid: '💼 Unpaid Leave',
  doctor: '🏥 Doctor Visit',
};

// Initial quick suggestions shown before any messages
const INITIAL_SUGGESTIONS = [
  '📋 Show my leave balance',
  '📆 Book a vacation',
  '🤒 I feel sick today',
  '👥 Who is on leave this week?',
  '📅 Best dates for vacation',
  '📊 Show my leave history',
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((s) => s.user);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // wait for animation
    }
  }, [isOpen]);

  const handleAction = async (messageId: string, action: AnyAction, actionIndex: number) => {
    if (!user?.id) {
      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, bookingStates: { ...m.bookingStates, [actionIndex]: { status: 'conflict', result: 'Not logged in.' } } }
          : m
      ));
      return;
    }

    setMessages(prev => prev.map(m =>
      m.id === messageId
        ? { ...m, bookingStates: { ...m.bookingStates, [actionIndex]: { status: 'loading' } } }
        : m
    ));

    try {
      let url = '';
      let body: Record<string, unknown> = {};

      if (action.type === 'BOOK_LEAVE') {
        url = '/api/chat/book-leave';
        body = {
          userId: user.id,
          type: action.leaveType,
          startDate: action.startDate,
          endDate: action.endDate,
          days: action.days,
          reason: action.reason,
        };
      } else if (action.type === 'EDIT_LEAVE') {
        url = '/api/chat/edit-leave';
        body = {
          requesterId: user.id,
          leaveId: action.leaveId,
          startDate: action.startDate,
          endDate: action.endDate,
          days: action.days,
          reason: action.reason,
          type: action.leaveType,
        };
      } else if (action.type === 'DELETE_LEAVE') {
        url = '/api/chat/delete-leave';
        body = {
          requesterId: user.id,
          leaveId: action.leaveId,
          employeeName: (action as DeleteLeaveAction).employeeName,
          startDate: (action as DeleteLeaveAction).startDate,
          endDate: (action as DeleteLeaveAction).endDate,
          leaveType: (action as DeleteLeaveAction).leaveType,
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => prev.map(m =>
          m.id === messageId
            ? { ...m, bookingStates: { ...m.bookingStates, [actionIndex]: { status: 'booked', result: data.message || 'Done!' } } }
            : m
        ));
      } else {
        setMessages(prev => prev.map(m =>
          m.id === messageId
            ? { ...m, bookingStates: { ...m.bookingStates, [actionIndex]: { status: 'conflict', result: data.error || 'Something went wrong.' } } }
            : m
        ));
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, bookingStates: { ...m.bookingStates, [actionIndex]: { status: 'conflict', result: 'Network error. Please try again.' } } }
          : m
      ));
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          userId: user?.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(value, { stream: true });
          const { cleanContent } = parseActions(fullContent);
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, content: cleanContent } : m
          ));
        }
      }

      const { cleanContent, actions } = parseActions(fullContent);
      const suggestions = getFollowUpSuggestions(cleanContent, user?.role || 'employee');

      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? {
              ...m,
              content: cleanContent,
              actions,
              bookingStates: Object.fromEntries(actions.map((_, i) => [i, { status: 'pending' as const }])),
              suggestions,
            }
          : m
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (suggestion: string) => {
    // Strip emoji prefix for cleaner message
    const clean = suggestion.replace(/^[\p{Emoji}\s]+/u, '').trim();
    sendMessage(clean);
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-2xl shadow-[#6366f1]/40 flex items-center justify-center hover:scale-105 transition-transform"
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] flex flex-col rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden"
            style={{ background: 'var(--card)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] flex-shrink-0 bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">HR Assistant</p>
                <p className="text-[10px] text-[var(--text-muted)]">Ask me anything about leaves & HR</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="ml-auto p-1.5 rounded-lg hover:bg-[var(--background-subtle)] transition-colors">
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

              {/* Initial suggestions (shown when no messages) */}
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <p className="text-xs text-[var(--text-muted)] text-center">👋 Hi {user?.name?.split(' ')[0] || 'there'}! What can I help you with?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {INITIAL_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        disabled={isLoading}
                        className="text-left px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background-subtle)] hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 hover:text-[#6366f1] text-xs text-[var(--text-primary)] transition-all duration-150 disabled:opacity-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Messages */}
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white rounded-br-sm'
                            : 'bg-[var(--background-subtle)] text-[var(--text-primary)] rounded-bl-sm'
                        }`}
                      >
                        {m.content}
                      </div>

                      {/* Action cards */}
                      {m.actions && m.actions.length > 0 && (
                        <div className="w-full space-y-2">
                          {m.actions.map((action, idx) => {
                            const state = m.bookingStates?.[idx] ?? { status: 'pending' };
                            const isDelete = action.type === 'DELETE_LEAVE';
                            const isEdit = action.type === 'EDIT_LEAVE';

                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`rounded-xl border p-3 text-xs space-y-2 ${
                                  isDelete ? 'border-red-500/20 bg-red-500/5' : isEdit ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-[#6366f1]/20 bg-[#6366f1]/5'
                                }`}
                              >
                                <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                                  {isDelete ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : isEdit ? <Pencil className="w-3.5 h-3.5 text-yellow-500" /> : <Calendar className="w-3.5 h-3.5 text-[#6366f1]" />}
                                  {isDelete ? 'Cancel Leave' : isEdit ? 'Update Leave' : (LEAVE_TYPE_LABELS[( action as BookLeaveAction).leaveType] ?? 'Leave Request')}
                                </div>
                                <div className="text-[var(--text-muted)] space-y-0.5">
                                  {action.type !== 'DELETE_LEAVE' && (
                                    <>
                                      <p>📅 {action.startDate} → {action.endDate}</p>
                                      <p>⏱️ {action.days} day{action.days !== 1 ? 's' : ''}</p>
                                      {(action as BookLeaveAction).reason && <p>📝 {(action as BookLeaveAction).reason}</p>}
                                    </>
                                  )}
                                  {action.type === 'DELETE_LEAVE' && (
                                    <>
                                      <p>👤 {(action as DeleteLeaveAction).employeeName}</p>
                                      <p>📅 {(action as DeleteLeaveAction).startDate} → {(action as DeleteLeaveAction).endDate}</p>
                                      <p className="text-red-500 font-medium">⚠️ This action cannot be undone</p>
                                    </>
                                  )}
                                </div>

                                {state.status === 'pending' && (
                                  <button
                                    onClick={() => handleAction(m.id, action, idx)}
                                    className={`w-full py-2 px-3 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity ${
                                      isDelete ? 'bg-gradient-to-r from-red-500 to-red-600' : isEdit ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]'
                                    }`}
                                  >
                                    {isDelete ? '🗑️ Confirm Delete' : isEdit ? '✏️ Confirm Update' : '✅ Confirm & Send to Admin'}
                                  </button>
                                )}
                                {state.status === 'loading' && (
                                  <div className="flex items-center justify-center gap-2 py-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#6366f1]" />
                                    <span className="text-xs text-[var(--text-muted)]">Submitting...</span>
                                  </div>
                                )}
                                {state.status === 'booked' && (
                                  <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-green-600 dark:text-green-400">{state.result}</p>
                                  </div>
                                )}
                                {state.status === 'conflict' && (
                                  <div className="flex items-start gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-600 dark:text-red-400">{state.result}</p>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* Follow-up suggestions after assistant message */}
                      {!isUser && m.suggestions && m.suggestions.length > 0 && !isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex flex-wrap gap-1.5 mt-1"
                        >
                          {m.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSuggestion(s)}
                              disabled={isLoading}
                              className="px-2.5 py-1 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/5 hover:bg-[#6366f1]/15 hover:border-[#6366f1]/60 text-[10px] text-[#6366f1] font-medium transition-all duration-150 disabled:opacity-50"
                            >
                              {s}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--background-subtle)] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#6366f1]" />
                    <span className="text-xs text-[var(--text-muted)]">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex-shrink-0">
                <p className="text-xs text-red-500">⚠️ {error}</p>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border)] flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about leaves, book time off..."
                  className="flex-1 px-4 py-2 bg-[var(--background-subtle)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#6366f1] text-sm"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
