'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/useHaptic';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  /** Swipe distance to trigger action (default: 100) */
  threshold?: number;
  className?: string;
}

/**
 * Tinder-like swipeable card. Swipe right = approve/done, swipe left = reject/snooze.
 * Shows colored overlay with icon as user drags.
 */
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = 'Reject',
  rightLabel = 'Done',
  threshold = 100,
  className,
}: SwipeableCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const startX = useRef(0);
  const haptic = useHaptic();
  const triggered = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0]!.clientX;
    setSwiping(true);
    triggered.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!swiping) return;
      const dx = e.touches[0]!.clientX - startX.current;
      setOffsetX(dx);
      // Haptic when crossing threshold
      if (!triggered.current && Math.abs(dx) >= threshold) {
        haptic('medium');
        triggered.current = true;
      }
      if (triggered.current && Math.abs(dx) < threshold) {
        triggered.current = false;
      }
    },
    [swiping, threshold, haptic],
  );

  const handleTouchEnd = useCallback(() => {
    setSwiping(false);
    if (offsetX >= threshold && onSwipeRight) {
      haptic('success');
      setDismissed(true);
      setTimeout(() => onSwipeRight(), 200);
    } else if (offsetX <= -threshold && onSwipeLeft) {
      haptic('error');
      setDismissed(true);
      setTimeout(() => onSwipeLeft(), 200);
    } else {
      setOffsetX(0);
    }
  }, [offsetX, threshold, onSwipeRight, onSwipeLeft, haptic]);

  if (dismissed) return null;

  const progress = Math.min(Math.abs(offsetX) / threshold, 1);
  const isRight = offsetX > 0;

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      {/* Background indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <div
          className={cn(
            'flex items-center gap-2 transition-opacity',
            isRight ? 'opacity-0' : `opacity-${progress > 0.3 ? '100' : '0'}`,
          )}
        >
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <X className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-xs font-medium text-red-500">{leftLabel}</span>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 transition-opacity',
            !isRight ? 'opacity-0' : `opacity-${progress > 0.3 ? '100' : '0'}`,
          )}
        >
          <span className="text-xs font-medium text-emerald-500">{rightLabel}</span>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Card content */}
      <div
        className="relative bg-(--card) border border-(--border) rounded-xl transition-transform"
        style={{
          transform: `translateX(${offsetX}px) rotate(${offsetX * 0.03}deg)`,
          transition: swiping ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
