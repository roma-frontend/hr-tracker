'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  onClick?: () => void;
  avatar?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Unified mobile card for list views.
 * Consistent pattern: avatar | title+subtitle | badge, with optional meta row and action footer.
 */
export function MobileCard({
  onClick,
  avatar,
  title,
  subtitle,
  badge,
  meta,
  actions,
  className,
}: MobileCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-(--border) bg-(--card) overflow-hidden',
        'active:bg-(--background-subtle) transition-colors',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 gap-3 cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {avatar && <div className="shrink-0">{avatar}</div>}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-(--text-primary) truncate">{title}</p>
            {subtitle && <p className="text-xs text-(--text-muted) truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {badge}
          <ChevronRight className="w-4 h-4 text-(--text-muted)" />
        </div>
      </div>

      {/* Meta info */}
      {meta && <div className="px-4 pb-3 space-y-1.5">{meta}</div>}

      {/* Actions footer */}
      {actions && (
        <div className="border-t border-(--border) px-4 py-2.5 flex items-center gap-1">
          {actions}
        </div>
      )}
    </div>
  );
}
