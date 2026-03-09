/**
 * Driver Request Modal
 * 
 * Allows users to request a driver for a specific date/time
 * from the calendar view
 */

"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Car, MapPin, Clock, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DriverRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
}

export function DriverRequestModal({
  open,
  onOpenChange,
  selectedDate,
}: DriverRequestModalProps) {
  const { t } = useTranslation();
  const currentUser = useQuery(api.users.getCurrentUser, { email: undefined });
  const userId = currentUser?._id as Id<"users"> | undefined;
  const organizationId = currentUser?.organizationId as Id<"organizations"> | undefined;

  const availableDrivers = useQuery(
    api.drivers.getAvailableDrivers,
    organizationId ? { organizationId } : "skip"
  );

  const requestDriver = useMutation(api.drivers.requestDriver);

  const [selectedDriver, setSelectedDriver] = useState<Id<"drivers"> | "">("");
  const [tripInfo, setTripInfo] = useState({
    from: "",
    to: "",
    purpose: "",
    passengerCount: 1,
    notes: "",
  });
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

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

  const handleSubmit = async () => {
    if (!userId || !organizationId) {
      toast.error("Please login to request a driver");
      return;
    }

    if (!selectedDriver) {
      toast.error("Please select a driver");
      return;
    }

    if (!startTime || !endTime) {
      toast.error("Please select start and end time");
      return;
    }

    if (!tripInfo.from || !tripInfo.to) {
      toast.error("Please fill in pickup and dropoff locations");
      return;
    }

    try {
      await requestDriver({
        organizationId,
        requesterId: userId,
        driverId: selectedDriver as Id<"drivers">,
        startTime: new Date(startTime).getTime(),
        endTime: new Date(endTime).getTime(),
        tripInfo,
      });

      toast.success(t("driver.requestSubmitted", "Driver request submitted!"));
      onOpenChange(false);
      
      // Reset form
      setSelectedDriver("");
      setTripInfo({
        from: "",
        to: "",
        purpose: "",
        passengerCount: 1,
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to request driver");
    }
  };

  if (!currentUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            {t("driver.requestDriver", "Request Driver")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Select Driver */}
          <div>
            <Label>{t("driver.selectDriver", "Select Driver")}</Label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger>
                <SelectValue placeholder={t("driver.chooseDriver", "Choose a driver")} />
              </SelectTrigger>
              <SelectContent>
                {availableDrivers?.map((driver) => (
                  <SelectItem key={driver._id} value={driver._id}>
                    {driver.userName} - {driver.vehicleInfo.model} ({driver.vehicleInfo.plateNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableDrivers && availableDrivers.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {t("driver.noDriversFound", "No drivers available")}
              </p>
            )}
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t("driver.pickupLocation", "Pickup Location")}
              </Label>
              <Input
                value={tripInfo.from}
                onChange={(e) => setTripInfo({ ...tripInfo, from: e.target.value })}
                placeholder={t("driver.fromPlaceholder", "e.g., Office")}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t("driver.dropoffLocation", "Dropoff Location")}
              </Label>
              <Input
                value={tripInfo.to}
                onChange={(e) => setTripInfo({ ...tripInfo, to: e.target.value })}
                placeholder={t("driver.toPlaceholder", "e.g., Airport")}
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <Label>{t("driver.tripPurpose", "Trip Purpose")}</Label>
            <Input
              value={tripInfo.purpose}
              onChange={(e) => setTripInfo({ ...tripInfo, purpose: e.target.value })}
              placeholder={t("driver.purposePlaceholder", "e.g., Airport transfer, Client meeting")}
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t("driver.startTime", "Start Time")}
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
                {t("driver.endTime", "End Time")}
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
              {t("driver.passengerCount", "Passengers")}
            </Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={tripInfo.passengerCount}
              onChange={(e) => setTripInfo({ ...tripInfo, passengerCount: parseInt(e.target.value) || 1 })}
            />
          </div>

          {/* Notes */}
          <div>
            <Label>{t("driver.notes", "Notes")} ({t("optional", "Optional")})</Label>
            <Textarea
              value={tripInfo.notes}
              onChange={(e) => setTripInfo({ ...tripInfo, notes: e.target.value })}
              placeholder={t("driver.notesPlaceholder", "Additional information for the driver...")}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel", "Cancel")}
            </Button>
            <Button onClick={handleSubmit}>
              {t("driver.submitRequest", "Submit Request")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
