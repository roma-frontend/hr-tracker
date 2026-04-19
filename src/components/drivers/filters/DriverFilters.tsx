/**
 * DriverFilters - Capacity and sort filters
 */

'use client';

import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, SortAsc } from 'lucide-react';

interface DriverFiltersProps {
  capacityFilter: number | null;
  sortBy: 'rating' | 'name' | 'availability';
  onCapacityChange: (value: number | null) => void;
  onSortChange: (value: 'rating' | 'name' | 'availability') => void;
}

export const DriverFilters = memo(function DriverFilters({
  capacityFilter,
  sortBy,
  onCapacityChange,
  onSortChange,
}: DriverFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="w-4 h-4 text-(--text-muted)" />
      <Select
        value={String(capacityFilter ?? 0)}
        onValueChange={(v) => onCapacityChange(v === '0' ? null : Number(v))}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs" style={{ borderRadius: '0.75rem' }}>
          <SelectValue placeholder={t('driver.minSeats', t('drivers.minSeats'))} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">{t('driver.anyCapacity', t('drivers.anyCapacity'))}</SelectItem>
          <SelectItem value="2">{t('driver.seats2Plus', '2+ seats')}</SelectItem>
          <SelectItem value="4">{t('driver.seats4Plus', '4+ seats')}</SelectItem>
          <SelectItem value="6">{t('driver.seats6Plus', '6+ seats')}</SelectItem>
          <SelectItem value="8">{t('driver.seats8Plus', '8+ seats')}</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[130px] h-8 text-xs" style={{ borderRadius: '0.75rem' }}>
          <SortAsc className="w-3 h-3 mr-1" />
          <SelectValue placeholder={t('driver.sortBy', t('drivers.sortBy'))} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating">{t('driver.byRating', t('drivers.byRating'))}</SelectItem>
          <SelectItem value="name">{t('driver.byName', t('drivers.byName'))}</SelectItem>
          <SelectItem value="availability">
            {t('driver.byAvailability', t('drivers.byAvailability'))}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});
