/**
 * Create Event Wizard - Пошаговая форма создания мероприятия
 * Использует универсальный Wizard компонент
 */

"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Wizard, WizardStep } from "@/components/ui/wizard";
import {
  TextInputStep,
  TextareaStep,
  SelectStep,
  CardSelectionStep,
} from "@/components/ui/wizard-step-components";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface CreateEventWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function CreateEventWizard({
  onComplete,
  onCancel,
}: CreateEventWizardProps) {
  const { t } = useTranslation();
  const createEvent = useMutation(api.events.createCompanyEvent);

  const steps: WizardStep[] = [
    {
      id: "type",
      title: t("eventWizard.steps.type.title"),
      description: t("eventWizard.steps.type.description"),
      icon: <Calendar className="w-5 h-5" />,
      content: (
        <CardSelectionStep
          stepData={{}}
          updateStepData={() => {}}
          field="type"
          label={t("eventWizard.steps.type.typeLabel")}
          options={[
            {
              value: "meeting",
              title: t("event.types.meeting"),
              description: t("event.types.meetingDesc"),
              icon: <Users className="w-6 h-6" />,
              color: "bg-blue-500/10 text-blue-600",
            },
            {
              value: "training",
              title: t("event.types.training"),
              description: t("event.types.trainingDesc"),
              icon: <Calendar className="w-6 h-6" />,
              color: "bg-green-500/10 text-green-600",
            },
            {
              value: "celebration",
              title: t("event.types.celebration"),
              description: t("event.types.celebrationDesc"),
              icon: <Clock className="w-6 h-6" />,
              color: "bg-purple-500/10 text-purple-600",
            },
            {
              value: "other",
              title: t("event.types.other"),
              description: t("event.types.otherDesc"),
              icon: <MapPin className="w-6 h-6" />,
              color: "bg-gray-500/10 text-gray-600",
            },
          ]}
          columns={2}
          required
        />
      ),
    },
    {
      id: "details",
      title: t("eventWizard.steps.details.title"),
      description: t("eventWizard.steps.details.description"),
      icon: <Calendar className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <TextInputStep
            stepData={{}}
            updateStepData={() => {}}
            field="title"
            label={t("eventWizard.steps.details.titleLabel")}
            placeholder={t("eventWizard.steps.details.titlePlaceholder")}
            required
          />
          <TextareaStep
            stepData={{}}
            updateStepData={() => {}}
            field="description"
            label={t("eventWizard.steps.details.descriptionLabel")}
            placeholder={t("eventWizard.steps.details.descriptionPlaceholder")}
            rows={4}
          />
        </div>
      ),
    },
    {
      id: "datetime",
      title: t("eventWizard.steps.datetime.title"),
      description: t("eventWizard.steps.datetime.description"),
      icon: <Clock className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInputStep
              stepData={{}}
              updateStepData={() => {}}
              field="date"
              label={t("eventWizard.steps.datetime.dateLabel")}
              type="date"
              required
            />
            <TextInputStep
              stepData={{}}
              updateStepData={() => {}}
              field="time"
              label={t("eventWizard.steps.datetime.timeLabel")}
              type="time"
              required
            />
          </div>
          <TextInputStep
            stepData={{}}
            updateStepData={() => {}}
            field="location"
            label={t("eventWizard.steps.datetime.locationLabel")}
            placeholder={t("eventWizard.steps.datetime.locationPlaceholder")}
          />
        </div>
      ),
    },
  ];

  const handleSubmit = async (data: Record<string, string | number | boolean | null>) => {
    try {
      const dateTime = new Date(`${String(data.date)}T${String(data.time)}`);
      
      await createEvent({
        title: String(data.title),
        description: String(data.description) || "",
        type: String(data.type) as "meeting" | "holiday" | "training" | "conference",
        date: dateTime.getTime(),
        location: String(data.location) || undefined,
      });

      toast.success(t("eventWizard.toast.success"));
      onComplete?.();
    } catch (error) {
      toast.error(t("eventWizard.toast.error"));
      console.error(error);
    }
  };

  return (
    <Wizard
      steps={steps}
      onComplete={handleSubmit}
      onCancel={onCancel}
      submitLabel={t("eventWizard.submit")}
      cancelLabel={t("actions.cancel")}
    />
  );
}
