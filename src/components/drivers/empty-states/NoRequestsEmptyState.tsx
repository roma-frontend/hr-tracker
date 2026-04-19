/**
 * NoRequestsEmptyState - Empty state when no requests
 */

'use client';

import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Clock, Plus } from 'lucide-react';

interface NoRequestsEmptyStateProps {
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export const NoRequestsEmptyState = memo(function NoRequestsEmptyState({
  title,
  description,
  onAction,
  actionLabel,
}: NoRequestsEmptyStateProps) {
  const { t } = useTranslation();

  const defaultTitle = t('emptyStates.noRequests.title', t('drivers.noRequestsYet'));
  const defaultDescription = t(
    'emptyStates.noRequests.description',
    "You haven't requested any drivers yet.",
  );
  const defaultAction = t('emptyStates.noRequests.action', 'Request Driver');

  return (
    <div
      className="text-center py-12"
      style={{
        padding: '3rem 2rem',
        borderRadius: '1.5rem',
        background: 'var(--background-subtle)',
        border: '2px dashed var(--border)',
      }}
    >
      <Clock className="w-16 h-16 mx-auto mb-4 text-(--text-muted) opacity-50" />
      <h3 className="text-lg font-semibold mb-2">{title || defaultTitle}</h3>
      <p className="text-sm text-(--text-muted) mb-4">{description || defaultDescription}</p>
      {onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          {actionLabel || defaultAction}
        </Button>
      )}
    </div>
  );
});
