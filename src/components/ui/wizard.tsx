/**
 * Multi-step Wizard Component
 * Универсальный компонент для пошаговых форм
 */

"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from '@/lib/cssMotion';
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepContent {
  stepData?: Record<string, string | number | boolean | null>;
  updateStepData?: (key: string, value: unknown) => void;
}

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  content: React.ReactElement<StepContent>;
  validation?: (data: Record<string, string | number | boolean | null>) => boolean;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete?: (data: Record<string, string | number | boolean | null>) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  showStepper?: boolean;
  className?: string;
  defaultStepData?: Record<string, string | number | boolean | null>;
}

export function Wizard({
  steps,
  onComplete,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  showStepper = true,
  className,
  defaultStepData = {},
}: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, string | number | boolean | null>>(defaultStepData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepData = steps[currentStep];

  const canGoNext = useCallback(() => {
    if (!currentStepData.validation) return true;
    return currentStepData.validation(stepData);
  }, [currentStepData, stepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canGoNext()) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === steps.length - 1) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete?.(stepData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStepData = (key: string, value: string | number | boolean | null) => {
    setStepData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn("w-full p-6", className)}>
      {/* Stepper */}
      {showStepper && (
        <div className="mb-8">
          {/* Progress Bar */}
          <div className="relative h-2 bg-(--background-subtle) rounded-full overflow-hidden mb-6">
            <motion.div
              className="absolute inset-y-0 left-0 bg-(--primary)"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>

          {/* Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                        isCompleted
                          ? "bg-(--primary) border-(--primary) text-white"
                          : isCurrent
                          ? "border-(--primary) bg-(--background) text-(--primary)"
                          : "border-(--border) bg-(--background) text-(--muted-foreground)"
                      )}
                      initial={{ scale: 1 }}
                      animate={{ scale: isCurrent ? 1.1 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </motion.div>
                    <div className="mt-2 text-center">
                      <p
                        className={cn(
                          "text-xs font-medium transition-colors",
                          isCurrent
                            ? "text-(--primary)"
                            : "text-(--muted-foreground)"
                        )}
                      >
                        {step.title}
                      </p>
                      {step.description && (
                        <p className="text-xs text-(--muted-foreground) mt-0.5 hidden sm:block">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-(--border) mx-2">
                      <motion.div
                        className={cn(
                          "h-full transition-colors",
                          isCompleted ? "bg-(--primary)" : "bg-(--border)"
                        )}
                        initial={{ width: "0%" }}
                        animate={{ width: isCompleted ? "100%" : "0%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-(--text-primary) mb-2">
                {currentStepData.title}
              </h2>
              {currentStepData.description && (
                <p className="text-sm text-(--text-muted)">
                  {currentStepData.description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {React.cloneElement(currentStepData.content as React.ReactElement<{ stepData?: Record<string, string | number | boolean | null>; updateStepData?: (key: string, value: string | number | boolean | null) => void }>, {
                stepData,
                updateStepData,
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-(--border)">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
          className="border-(--border) bg-(--background) hover:bg-(--background-subtle) text-(--foreground)"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-(--border) bg-(--background) hover:bg-(--background-subtle) text-(--foreground)"
            >
              {cancelLabel}
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canGoNext() || isSubmitting}
            className={cn(
              "gap-2",
              currentStep === steps.length - 1
                ? "bg-(--primary) hover:bg-(--primary-hover) text-white"
                : "bg-(--primary) hover:bg-(--primary-hover) text-white"
            )}
          >
            {isSubmitting ? (
              "Processing..."
            ) : currentStep === steps.length - 1 ? (
              submitLabel
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
