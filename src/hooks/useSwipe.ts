'use client';

import { useRef, useEffect, useCallback } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface UseSwipeOptions {
  onSwipe?: (dir: SwipeDirection) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  /** Minimum distance in px to trigger swipe (default: 50) */
  threshold?: number;
  /** Max time in ms for the swipe gesture (default: 300) */
  maxTime?: number;
  /** Only trigger from edge of screen within this px (default: undefined = anywhere) */
  edgeSize?: number;
}

/**
 * Detects swipe gestures on a target element (or document).
 * Returns a ref to attach to the element, or call with no ref for document-level detection.
 */
export function useSwipe<T extends HTMLElement = HTMLElement>(options: UseSwipeOptions = {}) {
  const {
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    maxTime = 300,
    edgeSize,
  } = options;
  const ref = useRef<T>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      if (edgeSize && touch.clientX > edgeSize && touch.clientX < window.innerWidth - edgeSize)
        return;
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      startTime.current = Date.now();
    },
    [edgeSize],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!startTime.current) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;
      const dt = Date.now() - startTime.current;

      if (dt > maxTime) {
        startTime.current = 0;
        return;
      }

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < threshold && absDy < threshold) {
        startTime.current = 0;
        return;
      }

      let dir: SwipeDirection;
      if (absDx > absDy) {
        dir = dx > 0 ? 'right' : 'left';
      } else {
        dir = dy > 0 ? 'down' : 'up';
      }

      onSwipe?.(dir);
      if (dir === 'left') onSwipeLeft?.();
      if (dir === 'right') onSwipeRight?.();
      if (dir === 'up') onSwipeUp?.();
      if (dir === 'down') onSwipeDown?.();

      startTime.current = 0;
    },
    [threshold, maxTime, onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown],
  );

  useEffect(() => {
    const el = ref.current ?? document;
    el.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
    el.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart as EventListener);
      el.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return ref;
}
