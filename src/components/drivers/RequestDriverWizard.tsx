/**
 * Request Driver Wizard - Пошаговая форма заказа водителя
 * Использует универсальный Wizard компонент
 */

"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Wizard, WizardStep } from "@/components/ui/wizard";
import {
  TextInputStep,
  TextareaStep,
  CardSelectionStep,
} from "@/components/ui/wizard-step-components";
import { Car, MapPin, Clock, Calendar } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface RequestDriverWizardProps {
  userId: Id<"users">;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function RequestDriverWizard({
  userId,
  onComplete,
  onCancel,
}: RequestDriverWizardProps) {
  const { t } = useTranslation();
  const requestDriver = useMutation(api.drivers.requestDriver);
  const user = useQuery(api.users.getCurrentUser);

  const steps: WizardStep[] = [
    {
      id: "type",
      title: t("driverWizard.steps.type.title"),
      description: t("driverWizard.steps.type.description"),
      icon: <Car className="w-5 h-5" />,
      content: (
        <CardSelectionStep
          stepData={{}}
          updateStepData={() => {}}
          field="tripType"
          label={t("driverWizard.steps.type.typeLabel")}
          options={[
            {
              value: "one-way",
              title: t("driverWizard.types.oneWay"),
              description: t("driverWizard.types.oneWayDesc"),
              icon: <MapPin className="w-6 h-6" />,
              color: "bg-blue-500/10 text-blue-600",
            },
            {
              value: "round-trip",
              title: t("driverWizard.types.roundTrip"),
              description: t("driverWizard.types.roundTripDesc"),
              icon: <Calendar className="w-6 h-6" />,
              color: "bg-green-500/10 text-green-600",
            },
            {
              value: "corporate",
              title: t("driverWizard.types.corporate"),
              description: t("driverWizard.types.corporateDesc"),
              icon: <Car className="w-6 h-6" />,
              color: "bg-purple-500/10 text-purple-600",
            },
          ]}
          columns={3}
          required
        />
      ),
    },
    {
      id: "route",
      title: t("driverWizard.steps.route.title"),
      description: t("driverWizard.steps.route.description"),
      icon: <MapPin className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <TextInputStep
            stepData={{}}
            updateStepData={() => {}}
            field="from"
            label={t("driverWizard.steps.route.fromLabel")}
            placeholder={t("driverWizard.steps.route.fromPlaceholder")}
            required
          />
          <TextInputStep
            stepData={{}}
            updateStepData={() => {}}
            field="to"
            label={t("driverWizard.steps.route.toLabel")}
            placeholder={t("driverWizard.steps.route.toPlaceholder")}
            required
          />
        </div>
      ),
    },
    {
      id: "datetime",
      title: t("driverWizard.steps.datetime.title"),
      description: t("driverWizard.steps.datetime.description"),
      icon: <Clock className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInputStep
              stepData={{}}
              updateStepData={() => {}}
              field="date"
              label={t("driverWizard.steps.datetime.dateLabel")}
              type="date"
              required
            />
            <TextInputStep
              stepData={{}}
              updateStepData={() => {}}
              field="time"
              label={t("driverWizard.steps.datetime.timeLabel")}
              type="time"
              required
            />
          </div>
          <TextareaStep
            stepData={{}}
            updateStepData={() => {}}
            field="notes"
            label={t("driverWizard.steps.datetime.notesLabel")}
            placeholder={t("driverWizard.steps.datetime.notesPlaceholder")}
            rows={3}
          />
        </div>
      ),
    },
  ];

  const handleSubmit = async (data: Record<string, string | number | boolean | null>) => {
    try {
      const startTime = new Date(`${String(data.date)}T${String(data.time)}`).getTime();
      const endTime = startTime + 3600000; // +1 hour default

      await requestDriver({
        requesterId: userId,
        tripType: String(data.tripType) as "airport" | "regular" | "corporate",
        tripInfo: {
          from: String(data.from),
          to: String(data.to),
        },
        startTime,
        endTime,
        notes: data.notes ? String(data.notes) : undefined,
      });

      toast.success(t("driverWizard.toast.success"));
      onComplete?.();
    } catch (error) {
      toast.error(t("driverWizard.toast.error"));
      console.error(error);
    }
  };

  return (
    <Wizard
      steps={steps}
      onComplete={handleSubmit}
      onCancel={onCancel}
      submitLabel={t("driverWizard.submit")}
      cancelLabel={t("actions.cancel")}
    />
  );
}
