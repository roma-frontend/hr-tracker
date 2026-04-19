/**
 * RequestCardsList - List of request cards
 */

'use client';

import React, { memo } from 'react';
import { RequestCard } from './RequestCard';

interface RequestCardsListProps {
  requests: Array<{
    id: string;
    status: string;
    startTime?: number;
    tripInfo?: {
      from: string;
      to: string;
    };
    assignedDriver?: {
      userName: string;
    };
  }>;
  limit?: number;
  onViewDetails: (request: any) => void;
  onRate?: (request: any) => void;
}

export const RequestCardsList = memo(function RequestCardsList({
  requests,
  limit = 10,
  onViewDetails,
  onRate,
}: RequestCardsListProps) {
  const displayed = requests.slice(0, limit);

  return (
    <div className="space-y-3">
      {displayed.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onViewDetails={() => onViewDetails(request)}
          onRate={onRate ? () => onRate(request) : undefined}
        />
      ))}
    </div>
  );
});
