"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Loader2, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: BookLeaveAction;
  actionStatus?: 'pending' | 'booked' | 'conflict' | 'loading';
  actionResult?: string;
}

interface BookLeaveAction {
  type: 'BOOK_LEAVE';
  leaveType: 'paid' | 'sick' | 'family' | 'unpaid' | 'doctor';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
}

function parseAction(content: string): { cleanContent: string; action?: BookLeaveAction } {
  const actionMatch = content.match(/<ACTION>([\s\S]*?)<\/ACTION>/);
  if (!actionMatch) return { cleanContent: content };

  try {
    const action = JSON.parse(actionMatch[1].trim()) as BookLeaveAction;
    const cleanContent = content.replace(/<ACTION>[\s\S]*?<\/ACTION>/, '').trim();
    return { cleanContent, action };
  } catch {
    return { cleanContent: content };
  }
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  paid: '🏖 Paid Leave',
  sick: '🤒 Sick Leave',
  family: '👨‍👩‍👧 Family Leave',
  unpaid: '📋 Unpaid Leave',
  doctor: '🏥 Doctor Visit',
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);

  // Auto-scroll to bottom smoothly on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleBookLeave = async (messageId: string, action: BookLeaveAction) => {
    if (!user?.id) {
      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, actionStatus: 'conflict', actionResult: 'You must be logged in to book a leave.' }
          : m
      ));
      return;
    }

    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, actionStatus: 'loading' } : m
    ));

    try {
      const res = await fetch('/api/chat/book-leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: action.leaveType,
          startDate: action.startDate,
          endDate: action.endDate,
          days: action.days,
          reason: action.reason,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => prev.map(m =>
          m.id === messageId
            ? { ...m, actionStatus: 'booked', actionResult: data.message }
            : m
        ));
      } else {
        setMessages(prev => prev.map(m =>
          m.id === messageId
            ? { ...m, actionStatus: 'conflict', actionResult: data.message }
            : m
        ));
      }
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, actionStatus: 'conflict', actionResult: 'Failed to submit leave request. Please try again.' }
          : m
      ));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          userId: user?.id,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No reader');

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
      }]);

      let accumulatedContent = '';
      let previousChunk = '';
      let previousText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk === previousChunk && chunk.length < 10) continue;
        previousChunk = chunk;

        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;

          let text = null;
          const streamFormatMatch = line.match(/^(\d+):(.+)$/);
          if (streamFormatMatch) {
            const content = streamFormatMatch[2];
            if (content.startsWith('"')) {
              try {
                text = JSON.parse(content);
              } catch {
                const quotedMatch = content.match(/^"(.*?)"?$/);
                if (quotedMatch) text = quotedMatch[1];
              }
            } else {
              text = content;
            }
          } else if (!line.match(/^\d+:$/)) {
            text = line;
          }

          if (text && text.trim() && text !== previousText) {
            previousText = text;
            accumulatedContent += text;

            // Parse action from accumulated content
            const { cleanContent, action } = parseAction(accumulatedContent);

            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMessageId
                  ? { ...m, content: cleanContent, action, actionStatus: action ? 'pending' : undefined }
                  : m
              )
            );
          }
        }
      }
    } catch (err) {
      console.error('❌ Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white rounded-full shadow-2xl hover:shadow-[#6366f1]/50 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">HR AI Assistant</h3>
                  <p className="text-xs opacity-90">Ask me anything or book a leave!</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#6366f1]" />
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    Hi! I'm your HR AI Assistant
                  </h4>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    I can help you with:
                  </p>
                  <div className="space-y-2 text-left max-w-xs mx-auto">
                    {[
                      '📅 Your leave balance',
                      '🏖 Book a vacation',
                      '🤒 Request sick leave',
                      '👥 Team availability',
                      '📝 Leave policies',
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="text-sm text-[var(--text-muted)] bg-[var(--background-subtle)] p-2 rounded-lg"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex flex-col gap-1 max-w-[85%]">
                    <span className={`text-xs font-medium px-2 ${
                      m.role === 'user' ? 'text-[#6366f1] text-right' : 'text-[#8b5cf6] text-left'
                    }`}>
                      {m.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>

                    <div className={`p-3 rounded-2xl ${
                      m.role === 'user'
                        ? 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white rounded-tr-sm'
                        : 'bg-[var(--background-subtle)] text-[var(--text-primary)] rounded-tl-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    </div>

                    {/* Booking Action Card */}
                    {m.action && m.role === 'assistant' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-3 rounded-xl border border-[#6366f1]/30 bg-[var(--background-subtle)]"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-[#6366f1]" />
                          <span className="text-xs font-semibold text-[var(--text-primary)]">
                            Leave Request
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-muted)] space-y-1 mb-3">
                          <p><span className="font-medium">Type:</span> {LEAVE_TYPE_LABELS[m.action.leaveType]}</p>
                          <p><span className="font-medium">From:</span> {m.action.startDate}</p>
                          <p><span className="font-medium">To:</span> {m.action.endDate}</p>
                          <p><span className="font-medium">Days:</span> {m.action.days}</p>
                          <p><span className="font-medium">Reason:</span> {m.action.reason}</p>
                        </div>

                        {m.actionStatus === 'pending' && (
                          <button
                            onClick={() => handleBookLeave(m.id, m.action!)}
                            className="w-full py-2 px-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                          >
                            ✅ Confirm & Send to Admin
                          </button>
                        )}

                        {m.actionStatus === 'loading' && (
                          <div className="flex items-center justify-center gap-2 py-2">
                            <Loader2 className="w-4 h-4 animate-spin text-[#6366f1]" />
                            <span className="text-xs text-[var(--text-muted)]">Submitting...</span>
                          </div>
                        )}

                        {m.actionStatus === 'booked' && (
                          <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-green-600 dark:text-green-400">{m.actionResult}</p>
                          </div>
                        )}

                        {m.actionStatus === 'conflict' && (
                          <div className="flex items-start gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-600 dark:text-red-400">{m.actionResult}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--background-subtle)] p-3 rounded-2xl">
                    <Loader2 className="w-4 h-4 animate-spin text-[#6366f1]" />
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex-shrink-0">
                <p className="text-xs text-red-500">Error: {error}</p>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-[var(--border)] flex-shrink-0"
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me or say 'Book vacation March 10-15'..."
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
