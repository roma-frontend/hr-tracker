"use client";

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.log('📤 Sending message:', userMessage.content);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Response received');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No reader');

      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
      };

      setMessages(prev => [...prev, assistantMessage]);

      let accumulatedContent = ''; // Track accumulated content
      let previousChunk = '';
      let previousText = ''; // Track previous extracted text to avoid duplicates

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log('📦 Raw chunk:', chunk);
        
        // Skip if this chunk is the same as previous (avoid duplicates)
        if (chunk === previousChunk && chunk.length < 10) {
          console.log('⏭️ Skipping duplicate chunk');
          continue;
        }
        previousChunk = chunk;
        
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim()) continue;
          
          console.log('📝 Processing line:', line);
          
          // Try to parse as stream format: N:"text" where N is a number
          let text = null;
          
          // Check if line starts with a digit followed by colon (0:, 1:, 2:, etc.)
          const streamFormatMatch = line.match(/^(\d+):(.+)$/);
          if (streamFormatMatch) {
            // Extract the content after the prefix
            const content = streamFormatMatch[2];
            
            // Try to parse as JSON string (with quotes)
            if (content.startsWith('"')) {
              try {
                text = JSON.parse(content);
                console.log('✅ Parsed JSON format:', text);
              } catch (e) {
                // If JSON parsing fails, try extracting quoted content manually
                const quotedMatch = content.match(/^"(.*?)"?$/);
                if (quotedMatch) {
                  text = quotedMatch[1];
                  console.log('✅ Extracted quoted text:', text);
                }
              }
            } else {
              // Direct text without quotes
              text = content;
              console.log('✅ Direct content:', text);
            }
          } else if (line.match(/^\d+:$/)) {
            // Skip lines like "0:", "1:" without content
            console.log('⏭️ Skipping empty prefix line');
          } else {
            // Direct text without prefix
            text = line;
            console.log('✅ Plain text:', text);
          }
          
          if (text && text.trim()) {
            // Skip if this is a duplicate of the previous text (same content twice in a row)
            if (text === previousText) {
              console.log('⏭️ Skipping duplicate text:', text);
              continue;
            }
            previousText = text;
            
            // Accumulate content locally
            accumulatedContent += text;
            
            // Update the message content immutably with accumulated content
            setMessages(prev => 
              prev.map(m => 
                m.id === assistantMessageId 
                  ? { ...m, content: accumulatedContent }
                  : m
              )
            );
          }
        }
      }
      
      console.log('🏁 Final message:', accumulatedContent);
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
            <div className="p-4 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">HR AI Assistant</h3>
                  <p className="text-xs opacity-90">Ask me anything about leaves!</p>
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
                    Ask me anything about:
                  </p>
                  <div className="space-y-2 text-left max-w-xs mx-auto">
                    {[
                      '📅 Your leave balance',
                      '🤔 Best time to take leave',
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
                <div
                  key={m.id}
                  className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    {/* Role label */}
                    <span className={`text-xs font-medium px-2 ${
                      m.role === 'user' 
                        ? 'text-[#6366f1] text-right' 
                        : 'text-[#8b5cf6] text-left'
                    }`}>
                      {m.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    
                    {/* Message bubble */}
                    <div
                      className={`p-3 rounded-2xl ${
                        m.role === 'user'
                          ? 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white rounded-tr-sm'
                          : 'bg-[var(--background-subtle)] text-[var(--text-primary)] rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    </div>
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
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
                <p className="text-xs text-red-500">Error: {error}</p>
              </div>
            )}

            {/* Input */}
            <form 
              onSubmit={(e) => {
                console.log('📤 Submitting message:', input);
                handleSubmit(e);
              }} 
              className="p-4 border-t border-[var(--border)]"
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 bg-[var(--background-subtle)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
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
