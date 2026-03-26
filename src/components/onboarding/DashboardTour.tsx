/**
 * Dashboard Tour — Интерактивный тур по Dashboard
 *
 * Минималистичный, плавный и адаптивный тур
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DashboardTourStep {
  id: string;
  target: string | null;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

interface DashboardTourProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function DashboardTour({ onComplete, onSkip }: DashboardTourProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Шаги тура — чистые и минималистичные
  const steps: DashboardTourStep[] = [
    {
      id: "welcome",
      target: null,
      title: t("dashboardTour.welcome.title"),
      description: t("dashboardTour.welcome.description"),
      placement: "center",
    },
    {
      id: "quick-stats",
      target: "[data-tour='quick-stats']",
      title: t("dashboardTour.quickStats.title"),
      description: t("dashboardTour.quickStats.description"),
      placement: "bottom",
    },
    {
      id: "leave-balance",
      target: "[data-tour='leave-balance']",
      title: t("dashboardTour.leaveBalance.title"),
      description: t("dashboardTour.leaveBalance.description"),
      placement: "bottom",
    },
    {
      id: "quick-actions",
      target: "[data-tour='quick-actions']",
      title: t("dashboardTour.quickActions.title"),
      description: t("dashboardTour.quickActions.description"),
      placement: "top",
    },
    {
      id: "navigation",
      target: "[data-tour='sidebar']",
      title: t("dashboardTour.navigation.title"),
      description: t("dashboardTour.navigation.description"),
      placement: "right",
    },
    {
      id: "complete",
      target: null,
      title: t("dashboardTour.complete.title"),
      description: t("dashboardTour.complete.description"),
      placement: "center",
    },
  ];

  // Отслеживание размера окна для адаптивности
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Найти целевой элемент
  const findTargetElement = useCallback((selector: string | null) => {
    if (!selector) return null;
    try {
      const element = document.querySelector(selector);
      return element || null;
    } catch {
      return null;
    }
  }, []);

  // Обновлять позицию при смене шага
  useEffect(() => {
    const step = steps[currentStep];
    if (!step) return;

    const element = findTargetElement(step.target);
    
    // Используем requestAnimationFrame для избежания cascading renders
    requestAnimationFrame(() => {
      setTargetElement(element);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);

        // Плавный скролл к элементу с отступом
        const offset = 100;
        const elementTop = rect.top + window.scrollY;
        const elementBottom = rect.bottom + window.scrollY;
        const viewportHeight = window.innerHeight;

        if (elementTop < window.scrollY + offset || elementBottom > window.scrollY + viewportHeight - offset) {
          window.scrollTo({
            top: elementTop - offset,
            behavior: "smooth",
          });
        }
      } else {
        setTargetRect(null);
      }
    });
  }, [currentStep, findTargetElement, steps]);

  // Вычислить позицию тултипа — адаптивно и плавно
  const getTooltipPosition = useCallback(() => {
    const isMobile = windowSize.width < 768;
    const tooltipWidth = isMobile ? Math.min(windowSize.width - 48, 340) : 340;
    const padding = 24;
    // Фиксированная высота тултипа (заголовок + описание + прогресс + кнопки + padding)
    const tooltipHeight = 260;

    // Для центральных шагов (welcome, complete)
    if (!targetRect || !targetElement) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: tooltipWidth,
      };
    }

    const viewportWidth = windowSize.width;
    const viewportHeight = windowSize.height;
    const scrollTop = window.scrollY;

    // Получаем placement из текущего шага
    let finalPlacement = steps[currentStep].placement || "bottom";

    // На мобильных всегда показываем снизу или по центру
    if (isMobile) {
      finalPlacement = finalPlacement === "left" || finalPlacement === "right" ? "bottom" : finalPlacement;
    }

    // Проверяем доступное место для каждого placement
    const spaceAbove = targetRect.top;
    const spaceBelow = viewportHeight - targetRect.bottom;
    const spaceLeft = targetRect.left;
    const spaceRight = viewportWidth - targetRect.right;

    // Автоматически меняем placement если недостаточно места
    if (finalPlacement === "top" && spaceAbove < tooltipHeight + padding) {
      finalPlacement = "bottom";
    } else if (finalPlacement === "bottom" && spaceBelow < tooltipHeight + padding) {
      finalPlacement = "top";
    } else if (finalPlacement === "left" && spaceLeft < tooltipWidth + padding) {
      finalPlacement = "right";
    } else if (finalPlacement === "right" && spaceRight < tooltipWidth + padding) {
      finalPlacement = "left";
    }

    let top = 0;
    let left = 0;
    let transform = "";

    switch (finalPlacement) {
      case "top":
        top = targetRect.top + scrollTop - padding;
        left = targetRect.left + targetRect.width / 2;
        transform = "translateX(-50%) translateY(-100%)";
        break;
      case "bottom":
        top = targetRect.bottom + scrollTop + padding;
        left = targetRect.left + targetRect.width / 2;
        transform = "translateX(-50%)";
        break;
      case "left":
        top = targetRect.top + scrollTop + targetRect.height / 2;
        left = targetRect.left - padding;
        transform = "translateX(-100%) translateY(-50%)";
        break;
      case "right":
        top = targetRect.top + scrollTop + targetRect.height / 2;
        left = targetRect.right + padding;
        transform = "translateY(-50%)";
        break;
      default:
        top = scrollTop + viewportHeight / 2;
        left = viewportWidth / 2;
        transform = "translate(-50%, -50%)";
    }

    // === CLAMP LOGIC —确保 тултип остается в viewport ===
    
    // Вертикальный clamp
    const minTop = scrollTop + padding;
    const maxTop = scrollTop + viewportHeight - tooltipHeight - padding;
    let clampedTop = Math.max(minTop, Math.min(top, maxTop));
    
    // Горизонтальный clamp — учитываем transform
    let clampedLeft = left;
    const halfWidth = tooltipWidth / 2;
    
    if (transform.includes("translateX(-50%)")) {
      // Центрируем по left
      clampedLeft = Math.max(
        padding + halfWidth,
        Math.min(clampedLeft, viewportWidth - padding - halfWidth)
      );
    } else if (transform.includes("translateX(-100%)")) {
      // Left placement
      clampedLeft = Math.max(padding + tooltipWidth, clampedLeft);
    } else if (transform.includes("translateY(-50%)") && finalPlacement === "right") {
      // Right placement
      clampedLeft = Math.min(clampedLeft, viewportWidth - tooltipWidth - padding);
    }

    return {
      top: clampedTop,
      left: clampedLeft,
      transform,
      maxWidth: tooltipWidth,
      actualHeight: tooltipHeight,
    };
  }, [targetRect, targetElement, currentStep, steps, windowSize]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      onComplete?.();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip?.();
  };

  const position = getTooltipPosition();

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Затемнение фона */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
            onClick={handleSkip}
          />

          {/* Подсветка целевого элемента */}
          {targetRect && targetElement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed z-40 pointer-events-none"
              style={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                borderRadius: "8px",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.1)",
              }}
            />
          )}

          {/* Тултип */}
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="fixed z-50"
            style={{
              top: position.top,
              left: position.left,
              transform: position.transform,
              maxWidth: "calc(100vw - 48px)",
              maxHeight: "calc(100vh - 48px)",
              overflow: "auto",
            }}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-xl shadow-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              )}
              style={{ 
                maxWidth: position.maxWidth, 
                width: "100%",
              }}
            >
              <div className="p-5">
                {/* Заголовок с номером шага */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  <button
                    onClick={handleSkip}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close tour"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Заголовок */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                  {steps[currentStep].title}
                </h3>

                {/* Описание */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed break-words">
                  {steps[currentStep].description}
                </p>

                {/* Прогресс бар — тонкий и минималистичный */}
                <div className="mb-5">
                  <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((currentStep + 1) / steps.length) * 100}%`,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="h-full bg-gray-900 dark:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Кнопки навигации */}
                <div className="flex gap-2">
                  {currentStep > 0 ? (
                    <Button
                      onClick={handlePrev}
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-sm border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                      Back
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSkip}
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-9 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Skip
                    </Button>
                  )}

                  <Button
                    onClick={handleNext}
                    size="sm"
                    className={cn(
                      "flex-1 h-9 text-sm text-white transition-colors",
                      currentStep === steps.length - 1
                        ? "bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
                        : "bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
                    )}
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Finish
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
