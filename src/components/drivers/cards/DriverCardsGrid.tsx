/**
 * DriverCardsGrid - Grid of driver cards with stagger animation
 */

'use client';

import React, { memo } from 'react';
import { DriverCard } from './DriverCard';

interface DriverCardsGridProps {
  drivers: Array<{
    _id: string;
    userName: string;
    userAvatar?: string;
    userPosition?: string;
    rating: number;
    totalTrips: number;
    isOnShift?: boolean;
    vehicleInfo: {
      model: string;
      capacity: number;
      plateNumber: string;
    };
  }>;
  favoriteIds: Set<string>;
  onBook: (driverId: string) => void;
  onCalendar: (driverId: string) => void;
  onToggleFavorite: (driverId: string) => void;
}

export const DriverCardsGrid = memo(function DriverCardsGrid({
  drivers,
  favoriteIds,
  onBook,
  onCalendar,
  onToggleFavorite,
}: DriverCardsGridProps) {
  return (
    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 drivers-stagger">
      {drivers.map((driver) => (
        <DriverCard
          key={driver._id}
          driver={driver}
          isFavorite={favoriteIds.has(driver._id)}
          onBook={onBook}
          onCalendar={onCalendar}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
});
