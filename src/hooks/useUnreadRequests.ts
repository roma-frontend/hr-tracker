/**
 * 🔔 useUnreadRequestsCount Hook
 * Real-time unread requests counter with blinking effect
 */

import { useUnreadLeavesCount } from '@/hooks/useLeaves';
import { useEffect, useState } from 'react';

export function useUnreadRequestsCount(userId?: string | null) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Get unread count from leaves
  const { data: unreadCount } = useUnreadLeavesCount(userId || undefined);

  // Reset blinking when component mounts and unread changes
  useEffect(() => {
    if (unreadCount && unreadCount > 0) {
      setIsBlinking(true);
    } else {
      setIsBlinking(false);
    }
  }, [unreadCount]);

  return {
    count: unreadCount ?? 0,
    isBlinking,
    hasUnread: (unreadCount ?? 0) > 0,
  };
}

/**
 * Hook to update document title with unread count
 * Shows "[3] Dashboard" when 3 unread requests
 */
export function useTitleBadge(count: number, originalTitle = 'Dashboard') {
  useEffect(() => {
    if (count > 0) {
      document.title = `[${count}] ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [count, originalTitle]);
}

/**
 * Hook for tab visibility blinking effect
 * Makes the tab title blink when there are unread requests
 */
export function useTabBlink(count: number, enabled = true) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!enabled || count === 0) return;

    const interval = setInterval(() => {
      setIsVisible((prev) => !prev);
    }, 600); // Blink every 600ms

    return () => clearInterval(interval);
  }, [count, enabled]);

  return isVisible;
}
