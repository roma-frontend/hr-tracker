"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  Menu,
  X,
  Bot,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Share,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Brain,
  Lightbulb,
  ChevronRight,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
};

type Conversation = {
  id: string;
  title: string;
  date: Date;
  preview: string;
};

export default function AIChatPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: "initial-1", title: t('aiChat.newChat'), date: new Date(), preview: "" },
  ]);
  const [activeConversation, setActiveConversation] = useState<string>("1");
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageIdCounter = useRef(0);

  const generateId = () => {
    messageIdCounter.current += 1;
    return `msg-${messageIdCounter.current}-${Date.now()}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // Auto-rename chat if this is the first message
    if (messages.length === 0) {
      const newTitle = currentInput.length > 30 ? currentInput.substring(0, 30) + "..." : currentInput;
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversation ? { ...conv, title: newTitle, preview: currentInput } : conv
      ));
    }

    // Simulate AI response with typing effect
    setTimeout(() => {
      const aiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: getAIResponse(currentInput),
        timestamp: new Date(),
        isTyping: true,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 800);
  };

  const getAIResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("отпуск") || lowerQuery.includes("leave") || lowerQuery.includes("արձակուրդ")) {
      return t('aiChat.aiResponses.leave');
    }

    if (lowerQuery.includes("задач") || lowerQuery.includes("task") || lowerQuery.includes("խնդիր")) {
      return t('aiChat.aiResponses.tasks');
    }

    if (lowerQuery.includes("привет") || lowerQuery.includes("hello") || lowerQuery.includes("ողջույն")) {
      return t('aiChat.aiResponses.greeting', { name: user?.name });
    }

    return t('aiChat.aiResponses.default', { query });
  };

  const quickQuestions = [
    { icon: Zap, text: t('aiChat.quickQuestions.leave'), color: "text-blue-500" },
    { icon: Brain, text: t('aiChat.quickQuestions.tasks'), color: "text-purple-500" },
    { icon: User, text: t('aiChat.quickQuestions.employees'), color: "text-green-500" },
    { icon: Lightbulb, text: t('aiChat.quickQuestions.attendance'), color: "text-orange-500" },
  ];

  const handleNewChat = () => {
    setMessages([]);
    const newConv = { id: generateId(), title: t('aiChat.newChat'), date: new Date(), preview: "" };
    setConversations([newConv, ...conversations]);
    setActiveConversation(newConv.id);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(t('aiChat.copied'));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 240);
      textarea.style.height = `${newHeight}px`;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--primary)]/[0.02]">
      {/* Animated Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full flex-shrink-0 overflow-hidden border-r"
            style={{ 
              background: "linear-gradient(180deg, var(--card) 0%, var(--card) 100%)",
              borderColor: "var(--border)"
            }}
          >
            <div className="w-[280px] h-full flex flex-col">
              {/* New Chat Button */}
              <div className="p-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNewChat}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all group"
                  style={{ 
                    background: "var(--primary)",
                    borderColor: "var(--primary)",
                    color: "white"
                  }}
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">{t('aiChat.newChat')}</span>
                </motion.button>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto px-3 pb-4">
                <div className="text-xs font-semibold text-muted-foreground mb-3 px-3 uppercase tracking-wider">
                  {t('aiChat.today')}
                </div>
                <div className="space-y-1.5">
                  {conversations.map((conv) => (
                    <motion.button
                      key={conv.id}
                      whileHover={{ x: 4 }}
                      onClick={() => setActiveConversation(conv.id)}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-sm text-left transition-all group ${
                        activeConversation === conv.id
                          ? "bg-[var(--primary)]/[0.08] border border-[var(--primary)]/[0.2]"
                          : "hover:bg-[var(--background-subtle)] border border-transparent"
                      }`}
                    >
                      <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        activeConversation === conv.id ? "text-[var(--primary)]" : "text-muted-foreground"
                      }`} />
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`font-medium truncate ${
                          activeConversation === conv.id ? "text-[var(--primary)]" : "text-[var(--text-primary)]"
                        }`}>
                          {conv.title}
                        </p>
                        {conv.preview && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {conv.preview}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* User Profile */}
              <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
                <motion.div
                  whileHover={{ background: "var(--background-subtle)" }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  <Avatar className="w-9 h-9 ring-2 ring-[var(--primary)]/[0.2]">
                    <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/[0.7] text-white text-sm font-semibold">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 flex-shrink-0 backdrop-blur-xl" style={{ 
          borderColor: "var(--border)",
          background: "var(--background)/[0.8]"
        }}>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </motion.button>
            
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)",
                }}
                whileHover={{ rotate: 5 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                  {t('aiChat.title')}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {user?.role === "superadmin" ? t('aiChat.roleSuperadmin') : user?.role === "admin" ? t('aiChat.roleAdmin') : t('aiChat.roleEmployee')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewChat}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--background-subtle)] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t('aiChat.newChat')}
            </motion.button>
          </div>
        </header>

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth"
        >
          {messages.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center px-4 py-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-3xl"
              >
                {/* Hero Icon */}
                <motion.div 
                  className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl"
                  style={{ 
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)",
                  }}
                  animate={{ 
                    y: [0, -10, 0],
                    boxShadow: [
                      "0 20px 40px var(--primary)/[0.3]",
                      "0 30px 60px var(--primary)/[0.4]",
                      "0 20px 40px var(--primary)/[0.3]",
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Bot className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t('aiChat.welcomeTitle', { name: user?.name?.split(" ")[0] || "" })}
                </motion.h2>

                {/* Subtitle */}
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground mb-10 text-lg"
                >
                  {t('aiChat.welcomeSubtitle')}
                </motion.p>

                {/* Quick Questions */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full"
                >
                  {quickQuestions.map((q, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInput(q.text.replace(/^[^\w\s]+/, "").trim())}
                      className="group p-4 rounded-2xl border-2 text-left transition-all hover:shadow-lg"
                      style={{ 
                        background: "var(--card)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-[var(--background-subtle)] group-hover:scale-110 transition-transform`}>
                          <q.icon className={`w-4 h-4 ${q.color}`} />
                        </div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {q.text}
                        </p>
                        <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          ) : (
            /* Messages */
            <div className="max-w-4xl mx-auto py-8 px-4 md:px-6 space-y-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <motion.div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                        message.role === "user" 
                          ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                          : "bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/[0.8]"
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {message.role === "user" ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </motion.div>

                    {/* Message Content */}
                    <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                      <div className={`flex items-center gap-2 mb-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {message.role === "user" ? t('aiChat.you') : t('aiChat.assistantName')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      
                      <motion.div
                        className={`p-4 rounded-2xl ${
                          message.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
                        }`}
                        style={{
                          background: message.role === "user" 
                            ? "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)" 
                            : "var(--card)",
                          color: message.role === "user" ? "white" : "var(--text-primary)",
                          boxShadow: message.role === "user" 
                            ? "0 4px 15px var(--primary)/[0.3]" 
                            : "0 2px 10px var(--background-subtle)",
                        }}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </motion.div>

                      {/* Message Actions */}
                      {message.role === "assistant" && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-1 mt-2"
                        >
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleCopy(message.content)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Share className="w-3.5 h-3.5" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-start gap-4"
                >
                  <motion.div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                    style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)" }}
                  >
                    <Bot className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {t('aiChat.assistantName')}
                      </span>
                      <span className="text-xs text-muted-foreground">{t('aiChat.typing')}</span>
                    </div>
                    <div className="p-4 rounded-2xl rounded-tl-sm inline-block" style={{ background: "var(--card)" }}>
                      <div className="flex items-center gap-1.5">
                        <motion.div 
                          className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div 
                          className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div 
                          className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={scrollToBottom}
              className="absolute bottom-28 right-6 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <ArrowDown className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="border-t p-4 md:p-6 flex-shrink-0 backdrop-blur-xl" style={{
          borderColor: "var(--border)",
          background: "var(--background)/[0.8]"
        }}>
          <div className="max-w-4xl mx-auto w-full">
            <div className="relative w-full rounded-2xl border-2 transition-all shadow-lg"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder={t('aiChat.inputPlaceholder')}
                rows={1}
                className="w-full px-4 py-4 pr-14 rounded-xl bg-transparent outline-none resize-none overflow-hidden text-[var(--text-primary)] placeholder:text-muted-foreground"
                style={{
                  minHeight: "64px",
                  maxHeight: "240px",
                  lineHeight: "1.5"
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bottom-2 p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                style={{
                  background: input.trim() ? "var(--primary)" : "var(--background-subtle)",
                  color: input.trim() ? "white" : "var(--text-muted)",
                }}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground mt-3 text-center"
            >
              {t('aiChat.disclaimer')}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}
