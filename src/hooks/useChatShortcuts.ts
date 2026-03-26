"use client";

import { useEffect, useCallback } from "react";

interface UseChatShortcutsOptions {
  onSearch?: () => void;
  onNewConversation?: () => void;
  onSendMessage?: () => void;
  onEscape?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onReply?: () => void;
  onEditLastMessage?: () => void;
  disabled?: boolean;
}

/**
 * Keyboard shortcuts for chat:
 * - Ctrl/Cmd+K: Search messages
 * - Ctrl/Cmd+N: New conversation
 * - Ctrl/Cmd+Enter: Send message
 * - Escape: Close modals/search
 * - Arrow Up/Down: Navigate conversations (in list)
 * - Ctrl/Cmd+↑: Edit last message
 * - Ctrl/Cmd+R: Reply to selected message
 */
export function useChatShortcuts({
  onSearch,
  onNewConversation,
  onSendMessage,
  onEscape,
  onNavigateUp,
  onNavigateDown,
  onReply,
  onEditLastMessage,
  disabled = false,
}: UseChatShortcutsOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled) return;

    // Don't trigger shortcuts when typing in input fields (except specific combos)
    const target = e.target as HTMLElement;
    const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

    // Global shortcuts (work even in inputs)
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      onSearch?.();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      onNewConversation?.();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onSendMessage?.();
      return;
    }

    // Shortcuts that don't work in inputs
    if (!isInput) {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape?.();
        return;
      }

      if (e.key === "ArrowUp" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onEditLastMessage?.();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        onReply?.();
        return;
      }
    }

    // Navigation shortcuts (only when not in input)
    if (!isInput) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onNavigateUp?.();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        onNavigateDown?.();
        return;
      }
    }
  }, [onSearch, onNewConversation, onSendMessage, onEscape, onNavigateUp, onNavigateDown, onReply, onEditLastMessage, disabled]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
