'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

export function FAB({ onClick, icon, label = 'Create', className }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'fixed bottom-6 right-6 z-50 md:hidden',
        'flex h-14 w-14 items-center justify-center rounded-full',
        'bg-(--primary) text-(--primary-foreground) shadow-xl',
        'active:scale-95 transition-transform duration-150',
        'pb-[var(--safe-bottom)]',
        className,
      )}
    >
      {icon ?? <Plus className="h-6 w-6" />}
    </button>
  );
}
