'use client';

import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DriversPageHeader } from '../layout/DriversPageHeader';
import { PassengerStatsGrid } from '../layout/PassengerStatsGrid';
import { AvailableDriversSection } from './AvailableDriversSection';
import { MyRequestsSection } from './MyRequestsSection';

interface Driver {
  id: string;
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
}

interface Request {
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
}

interface RecurringTrip {
  id: string;
  isActive: boolean;
  days: number[];
  startTime: string;
  endTime: string;
  tripInfo: {
    from: string;
    to: string;
  };
}

interface DriverBookingPageProps {
  drivers: Driver[];
  activeRequests: Request[];
  historyRequests: Request[];
  recurringTrips: RecurringTrip[];
  favoriteIds: Set<string>;
  stats: {
    availableDrivers: number;
    pendingRequests: number;
    totalTrips: number;
  };
  searchQuery: string;
  capacityFilter: number | null;
  sortBy: 'rating' | 'name' | 'availability';
  onSearchChange: (value: string) => void;
  onCapacityChange: (value: number | null) => void;
  onSortChange: (value: 'rating' | 'name' | 'availability') => void;
  onBook: (driverId: string) => void;
  onCalendar: (driverId: string) => void;
  onToggleFavorite: (driverId: string) => void;
  onRequestDriver: () => void;
  onViewRequestDetails: (request: Request) => void;
  onRateRequest: (request: Request) => void;
  onEditRequest: (request: Request) => void;
  onDeleteRequest: (request: Request) => void;
  onCancelRequest: (request: Request) => void;
  onToggleRecurring: (trip: RecurringTrip) => void;
  onDeleteRecurring: (trip: RecurringTrip) => void;
  onRegisterAsDriver: () => void;
  canRegisterDrivers: boolean;
}

export const DriverBookingPage = memo(function DriverBookingPage({
  drivers,
  activeRequests,
  historyRequests,
  recurringTrips,
  favoriteIds,
  stats,
  searchQuery,
  capacityFilter,
  sortBy,
  onSearchChange,
  onCapacityChange,
  onSortChange,
  onBook,
  onCalendar,
  onToggleFavorite,
  onRequestDriver,
  onViewRequestDetails,
  onRateRequest,
  onEditRequest,
  onDeleteRequest,
  onCancelRequest,
  onToggleRecurring,
  onDeleteRecurring,
  onRegisterAsDriver,
  canRegisterDrivers,
}: DriverBookingPageProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-[1600px] mx-auto drivers-fade-in-up">
      {/* Header */}
      <DriversPageHeader
        title={t('driver.booking', 'Driver Booking')}
        subtitle={t('driver.bookingDesc', 'Book a driver for your business trips and transfers')}
        actions={
          <>
            {canRegisterDrivers && (
              <Button variant="outline" onClick={onRegisterAsDriver}>
                {t('driver.registerAsDriver', 'Register as Driver')}
              </Button>
            )}
            <Button onClick={onRequestDriver}>{t('driver.requestDriver', 'Request Driver')}</Button>
          </>
        }
      />

      {/* Stats */}
      <PassengerStatsGrid
        availableDrivers={stats.availableDrivers}
        pendingRequests={stats.pendingRequests}
        totalTrips={stats.totalTrips}
      />

      {/* Available Drivers */}
      <AvailableDriversSection
        drivers={drivers}
        favoriteIds={favoriteIds}
        searchQuery={searchQuery}
        capacityFilter={capacityFilter}
        sortBy={sortBy}
        onSearchChange={onSearchChange}
        onCapacityChange={onCapacityChange}
        onSortChange={onSortChange}
        onBook={onBook}
        onCalendar={onCalendar}
        onToggleFavorite={onToggleFavorite}
        onRequestDriver={onRequestDriver}
      />

      {/* My Requests */}
      <MyRequestsSection
        activeRequests={activeRequests}
        historyRequests={historyRequests}
        recurringTrips={recurringTrips}
        onViewDetails={onViewRequestDetails}
        onRate={onRateRequest}
        onEdit={onEditRequest}
        onDelete={onDeleteRequest}
        onCancel={onCancelRequest}
        onToggleRecurring={onToggleRecurring}
        onDeleteRecurring={onDeleteRecurring}
        onRequestDriver={onRequestDriver}
      />
    </div>
  );
});
