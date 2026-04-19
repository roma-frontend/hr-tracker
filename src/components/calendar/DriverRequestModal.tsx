/**
 * Driver Request Modal
 *
 * Allows users to request a driver for a specific date/time
 * from the calendar view
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSelectedOrganization } from '@/hooks/useSelectedOrganization';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Car, MapPin, Clock, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DriverMap } from '@/components/drivers/DriverMap';
import { PlaceAutocomplete } from '@/components/drivers/PlaceAutocomplete';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useAvailableDrivers,
  useCreateDriverRequest,
  useIsDriverOnLeave,
  useAlternativeDrivers,
} from '@/hooks/useDrivers';

interface DriverRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
}

export function DriverRequestModal({ open, onOpenChange, selectedDate }: DriverRequestModalProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const selectedOrgId = useSelectedOrganization();
  const organizationId = selectedOrgId ?? user?.organizationId;

  const availableDrivers = useAvailableDrivers(organizationId ?? undefined);

  const requestDriver = useCreateDriverRequest();

  const [leaveWarning, setLeaveWarning] = useState<{
    type: string;
    message: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  } | null>(null);

  const [selectedDriver, setSelectedDriver] = useState<string | ''>('');
  const [tripInfo, setTripInfo] = useState({
    from: '',
    to: '',
    purpose: '',
    passengerCount: 1,
    notes: '',
  });
  const [pickupCoords, setPickupCoords] = useState<
    { lat: number; lng: number; address?: string } | undefined
  >();
  const [dropoffCoords, setDropoffCoords] = useState<
    { lat: number; lng: number; address?: string } | undefined
  >();
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  const startTimeMs = startTime ? new Date(startTime).getTime() : undefined;
  const endTimeMs = endTime ? new Date(endTime).getTime() : undefined;

  const isDriverOnLeave = useIsDriverOnLeave(
    selectedDriver || undefined,
    startTimeMs,
    endTimeMs,
    !!selectedDriver && !!startTime && !!endTime,
  );

  const alternativeDrivers = useAlternativeDrivers(
    organizationId ?? undefined,
    startTimeMs,
    endTimeMs,
    selectedDriver || undefined,
    !!selectedDriver && !!startTime && !!endTime && !!leaveWarning,
  );

  // Geocode search state
  const [pickupQuery, setPickupQuery] = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [pickupResults, setPickupResults] = useState<
    { lat: number; lng: number; display_name: string }[]
  >([]);
  const [dropoffResults, setDropoffResults] = useState<
    { lat: number; lng: number; display_name: string }[]
  >([]);
  const [showPickupResults, setShowPickupResults] = useState(false);
  const [showDropoffResults, setShowDropoffResults] = useState(false);
  const pickupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropoffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const geocodeSearch = useCallback(
    async (query: string): Promise<{ lat: number; lng: number; display_name: string }[]> => {
      if (query.length < 3) {
        console.log('[geocode] Query too short:', query);
        return [];
      }
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
        console.log('[geocode] Searching:', url);
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'en,ru' },
        });
        if (!res.ok) {
          console.error('[geocode] HTTP error:', res.status);
          return [];
        }
        const data = await res.json();
        console.log('[geocode] Results:', data.length, data);
        if (data.length === 0) {
          console.log('[geocode] No results found');
          return [];
        }
        return data.map((item: any) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          display_name: item.display_name,
        }));
      } catch (err) {
        console.error('[geocode] Error:', err);
        return [];
      }
    },
    [],
  );

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-geocode-input]')) {
        setShowPickupResults(false);
        setShowDropoffResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePickupInputChange = (value: string) => {
    setPickupQuery(value);
    setTripInfo((prev) => ({ ...prev, from: value }));
    setPickupCoords(undefined);
    if (pickupTimerRef.current) clearTimeout(pickupTimerRef.current);
    if (value.length >= 3) {
      pickupTimerRef.current = setTimeout(async () => {
        const results = await geocodeSearch(value);
        setPickupResults(results);
        setShowPickupResults(results.length > 0);
      }, 400);
    } else {
      setPickupResults([]);
      setShowPickupResults(false);
    }
  };

  const handleDropoffInputChange = (value: string) => {
    setDropoffQuery(value);
    setTripInfo((prev) => ({ ...prev, to: value }));
    setDropoffCoords(undefined);
    if (dropoffTimerRef.current) clearTimeout(dropoffTimerRef.current);
    if (value.length >= 3) {
      dropoffTimerRef.current = setTimeout(async () => {
        const results = await geocodeSearch(value);
        setDropoffResults(results);
        setShowDropoffResults(results.length > 0);
      }, 400);
    } else {
      setDropoffResults([]);
      setShowDropoffResults(false);
    }
  };

  const selectPickupResult = (result: { lat: number; lng: number; display_name: string }) => {
    console.log('[selectPickupResult]', result);
    setPickupCoords({ lat: result.lat, lng: result.lng, address: result.display_name });
    setTripInfo((prev) => ({ ...prev, from: result.display_name }));
    setPickupQuery(result.display_name);
    setPickupResults([]);
    setShowPickupResults(false);
    // Map will auto-center via DriverMap useEffect when pickupCoords changes
  };

  const selectDropoffResult = (result: { lat: number; lng: number; display_name: string }) => {
    console.log('[selectDropoffResult]', result);
    setDropoffCoords({ lat: result.lat, lng: result.lng, address: result.display_name });
    setTripInfo((prev) => ({ ...prev, to: result.display_name }));
    setDropoffQuery(result.display_name);
    setDropoffResults([]);
    setShowDropoffResults(false);
    // Map will auto-center via DriverMap useEffect when dropoffCoords changes
  };

  // Handle location selection from map
  const handleLocationSelect = (
    location: { lat: number; lng: number; address?: string },
    type: 'pickup' | 'dropoff',
  ) => {
    if (type === 'pickup') {
      setPickupCoords(location);
      setTripInfo((prev) => ({ ...prev, from: location.address || prev.from }));
      setPickupQuery(location.address || '');
      setShowPickupResults(false);
    } else {
      setDropoffCoords(location);
      setTripInfo((prev) => ({ ...prev, to: location.address || prev.to }));
      setDropoffQuery(location.address || '');
      setShowDropoffResults(false);
    }
  };

  // Pre-fill time when selectedDate changes
  React.useEffect(() => {
    if (selectedDate && open) {
      // Set start time to 9:00 AM on selected date
      const start = new Date(selectedDate);
      start.setHours(9, 0, 0, 0);

      // Set end time to 6:00 PM on selected date
      const end = new Date(selectedDate);
      end.setHours(18, 0, 0, 0);

      setStartTime(start.toISOString().slice(0, 16));
      setEndTime(end.toISOString().slice(0, 16));
    }
  }, [selectedDate, open]);

  const isCheckingLeave = selectedDriver && startTime && endTime && isDriverOnLeave.isLoading;

  React.useEffect(() => {
    if (isDriverOnLeave.data?.onLeave && isDriverOnLeave.data.leave) {
      setLeaveWarning({
        type: 'driver_on_leave',
        message: t('driver.driverOnLeaveMessage', { startDate: isDriverOnLeave.data.leave.startDate, endDate: isDriverOnLeave.data.leave.endDate }),
        leaveType: isDriverOnLeave.data.leave.type,
        startDate: isDriverOnLeave.data.leave.startDate,
        endDate: isDriverOnLeave.data.leave.endDate,
        reason: isDriverOnLeave.data.leave.reason,
      });
    } else {
      setLeaveWarning(null);
    }
  }, [isDriverOnLeave.data]);

  const handleSubmit = async () => {
    if (!user?.id || !organizationId) {
      toast.error(t('toasts.pleaseLogin'));
      return;
    }

    if (!selectedDriver) {
      toast.error(t('toasts.pleaseSelectDriver'));
      return;
    }

    if (!startTime || !endTime) {
      toast.error(t('toasts.pleaseSelectTime'));
      return;
    }

    if (!tripInfo.from || !tripInfo.to) {
      toast.error(t('toasts.pleaseFillLocations'));
      return;
    }

    // Double check: also check isDriverOnLeave directly, not just leaveWarning
    if (isDriverOnLeave.data?.onLeave || leaveWarning) {
      const leaveInfo = isDriverOnLeave.data?.leave || leaveWarning;
      toast.error(
        t('driver.driverOnLeaveBlock'),
        {
          description:
            (leaveInfo as any).message ||
            t('driver.onLeaveFromTo', { startDate: (leaveInfo as any).startDate, endDate: (leaveInfo as any).endDate }),
          duration: 6000,
        },
      );
      return;
    }

    try {
      await requestDriver.mutateAsync({
        organizationId,
        driverId: selectedDriver,
        startTime: new Date(startTime).getTime(),
        endTime: new Date(endTime).getTime(),
        tripInfo: {
          from: tripInfo.from,
          to: tripInfo.to,
          purpose: tripInfo.purpose,
          passengerCount: tripInfo.passengerCount,
          notes: tripInfo.notes,
        },
      });

      toast.success(t('driver.requestSubmitted'));
      onOpenChange(false);

      // Reset form
      setSelectedDriver('');
      setTripInfo({
        from: '',
        to: '',
        purpose: '',
        passengerCount: 1,
        notes: '',
      });
      setPickupCoords(undefined);
      setDropoffCoords(undefined);
    } catch (error: any) {
      toast.error(
        error.message || t('driver.failedToRequestDriver'),
      );
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            {t('driver.requestDriver')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4" style={{ overflow: 'visible' }}>
          {/* Select Driver */}
          <div>
            <Label>{t('driver.selectDriver')}</Label>
            <Select
              value={selectedDriver}
              onValueChange={(v: string) => setSelectedDriver(v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('driver.chooseDriver')} />
              </SelectTrigger>
              <SelectContent>
                {availableDrivers.data?.filter(Boolean).map((driver: any) => (
                  <SelectItem key={driver!.id} value={driver!.id}>
                    {driver!.userName} - {driver!.vehicleInfo.model} (
                    {driver!.vehicleInfo.plateNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableDrivers.data && availableDrivers.data.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {t('driver.noDriversFound')}
              </p>
            )}
          </div>

          {/* Leave Warning Alert */}
          {leaveWarning && (
            <Alert variant="warning" className="border-amber-500 bg-amber-50 dark:bg-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">
                {t('driver.driverOnLeave')}
              </AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <p className="font-semibold mb-2">
                  ⛔ {t('driver.bookingUnavailable')}
                </p>
                {t('driver.onLeaveFrom')} {leaveWarning.startDate}{' '}
                {t('driver.to')} {leaveWarning.endDate}
                <div className="mt-2 text-sm">
                  <strong>{t('driver.leaveType')}:</strong>{' '}
                  {leaveWarning.leaveType === 'paid'
                    ? t('leave.types.paid')
                    : leaveWarning.leaveType === 'sick'
                      ? t('leave.types.sick')
                      : leaveWarning.leaveType === 'family'
                        ? t('leave.types.family')
                        : leaveWarning.leaveType === 'unpaid'
                          ? t('leave.types.unpaid')
                          : leaveWarning.leaveType}
                </div>
                {leaveWarning.reason && (
                  <div className="text-sm mt-1">
                    <strong>{t('driver.reason')}:</strong> {leaveWarning.reason}
                  </div>
                )}
                {/* Alternative Drivers */}
                {alternativeDrivers.data && alternativeDrivers.data.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      {t('driver.alternativeDrivers')}
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {alternativeDrivers.data.map((driver: any) => (
                        <div
                          key={driver.id}
                          className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={driver.userAvatar} />
                              <AvatarFallback>{driver.userName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                              <p className="font-medium text-amber-900 dark:text-amber-100">
                                {driver.userName}
                              </p>
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                {driver.vehicleInfo?.model} • {driver.vehicleInfo?.plateNumber}
                                {driver.vehicleInfo?.capacity &&
                                  ` • ${driver.vehicleInfo.capacity} ${t('driver.seats')}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                            onClick={() => {
                              setSelectedDriver(driver.id);
                              toast.success(
                                t('driver.driverSelected', { name: driver.userName }),
                              );
                            }}
                          >
                            {t('driver.select')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(!alternativeDrivers.data || alternativeDrivers.data.length === 0) && (
                  <p className="text-sm mt-3 text-amber-800 dark:text-amber-200">
                    💡{' '}
                    {t('driver.noAlternativeDrivers')}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Trip Details */}
          <div className="space-y-3">
            {/* Pickup */}
            <div>
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                {t('driver.pickupLocation')}
              </Label>
              <PlaceAutocomplete
                value={pickupQuery || tripInfo.from}
                onChange={(val) => {
                  setPickupQuery(val);
                  setTripInfo((prev) => ({ ...prev, from: val }));
                  setPickupCoords(undefined);
                }}
                onSelect={(place) => {
                  setPickupCoords({ lat: place.lat, lng: place.lng, address: place.address });
                  setTripInfo((prev) => ({ ...prev, from: place.address }));
                  setPickupQuery(place.address);
                }}
                placeholder={t('driver.fromPlaceholder')}
              />
            </div>

            {/* Dropoff */}
            <div>
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                {t('driver.dropoffLocation')}
              </Label>
              <PlaceAutocomplete
                value={dropoffQuery || tripInfo.to}
                onChange={(val) => {
                  setDropoffQuery(val);
                  setTripInfo((prev) => ({ ...prev, to: val }));
                  setDropoffCoords(undefined);
                }}
                onSelect={(place) => {
                  setDropoffCoords({ lat: place.lat, lng: place.lng, address: place.address });
                  setTripInfo((prev) => ({ ...prev, to: place.address }));
                  setDropoffQuery(place.address);
                }}
                placeholder={t('driver.toPlaceholder')}
              />
            </div>
          </div>

          {/* Map for location selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('driver.selectOnMap')}
              </Label>
              <Badge variant="secondary" className="text-xs">
                {t('driver.clickToPickLocation')}
              </Badge>
            </div>
            <div className="rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
              <DriverMap
                pickupLocation={tripInfo.from}
                dropoffLocation={tripInfo.to}
                pickupCoords={pickupCoords}
                dropoffCoords={dropoffCoords}
                height="300px"
                zoom={13}
                interactive={true}
                onLocationSelect={handleLocationSelect}
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <Label>{t('driver.tripPurpose')}</Label>
            <Input
              value={tripInfo.purpose}
              onChange={(e) => setTripInfo({ ...tripInfo, purpose: e.target.value })}
              placeholder={t('driver.purposePlaceholder')}
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('driver.startTime')}
              </Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('driver.endTime')}
              </Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Passengers */}
          <div>
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('driver.passengerCount')}
            </Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={tripInfo.passengerCount}
              onChange={(e) =>
                setTripInfo({ ...tripInfo, passengerCount: parseInt(e.target.value) || 1 })
              }
            />
          </div>

          {/* Notes */}
          <div>
            <Label>
              {t('driver.notes')} ({t('common.optional')})
            </Label>
            <Textarea
              value={tripInfo.notes}
              onChange={(e) => setTripInfo({ ...tripInfo, notes: e.target.value })}
              placeholder={t('driver.notesPlaceholder')}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={Boolean(leaveWarning) || Boolean(isCheckingLeave)}
            >
              {isCheckingLeave
                ? t('driver.checking')
                : leaveWarning
                  ? t('driver.driverOnLeave')
                  : t('driver.submitRequest')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
