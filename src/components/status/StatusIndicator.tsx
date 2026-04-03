'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Phone, Home, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status?: string;
  onClick?: () => void;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({
  status = 'available',
  onClick,
  showLabel = true,
  size = 'md',
}: StatusIndicatorProps) {
  const { t } = useTranslation();

  const statusConfig: Record<
    string,
    {
      icon: React.ReactNode;
      color: string;
      bgColor: string;
      label: string;
    }
  > = {
    available: {
      icon: <CheckCircle2 className="w-full h-full" />,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900',
      label: t('status.available.label', 'Available'),
    },
    in_meeting: {
      icon: <Clock className="w-full h-full" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      label: t('status.in_meeting.label', 'In Meeting'),
    },
    in_call: {
      icon: <Phone className="w-full h-full" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      label: t('status.in_call.label', 'In Call'),
    },
    out_of_office: {
      icon: <Home className="w-full h-full" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      label: t('status.out_of_office.label', 'Out of Office'),
    },
    busy: {
      icon: <Zap className="w-full h-full" />,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900',
      label: t('status.busy.label', 'Busy'),
    },
  };

  const config = statusConfig[status] || statusConfig.available;
  if (!config) return null;

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:shadow-md',
        config.bgColor,
        onClick && 'cursor-pointer',
      )}
      title={config.label}
    >
      <div className={cn(sizeClasses[size], config.color)}>{config.icon}</div>
      {showLabel && (
        <span className={cn('font-medium', labelSizeClasses[size])}>{config.label}</span>
      )}
    </button>
  );
}
