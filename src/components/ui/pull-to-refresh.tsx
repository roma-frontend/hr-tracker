'use client';

import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  /** Pull distance to trigger refresh (default: 80) */
  threshold?: number;
}

/**
 * Pull-to-refresh wrapper for mobile lists.
 * Wraps content and shows a spinner when pulled down past threshold.
 */
export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const el = containerRef.current;
      if (!el || el.scrollTop > 0 || refreshing) return;
      startY.current = e.touches[0]!.clientY;
      pulling.current = true;
    },
    [refreshing],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current) return;
      const dy = e.touches[0]!.clientY - startY.current;
      if (dy < 0) {
        setPullDistance(0);
        return;
      }
      // Dampen the pull (feels more natural)
      setPullDistance(Math.min(dy * 0.4, threshold * 1.5));
    },
    [threshold],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= threshold) {
      setRefreshing(true);
      setPullDistance(threshold * 0.5);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, onRefresh]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-y-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Spinner indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: pullDistance > 0 ? `${pullDistance}px` : 0 }}
      >
        <div
          className={cn(
            'w-6 h-6 rounded-full border-2 border-(--primary) border-t-transparent',
            refreshing && 'animate-spin',
          )}
          style={{
            opacity: Math.min(pullDistance / threshold, 1),
            transform: `rotate(${(pullDistance / threshold) * 360}deg)`,
          }}
        />
      </div>
      {children}
    </div>
  );
}
