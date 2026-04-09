/**
 * Wizard Step Components
 * Готовые компоненты для использования в шагах Wizard
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
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
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// ═══════════════════════════════════════════════════════════════
// Text Input Step
// ═══════════════════════════════════════════════════════════════
interface TextInputStepProps {
  stepData: Record<string, string | number | boolean | null>;
  updateStepData: (key: string, value: string | number | boolean | null) => void;
  field: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'number' | 'password' | 'date' | 'time';
}

export function TextInputStep({
  stepData,
  updateStepData,
  field,
  label,
  placeholder,
  description,
  required = false,
  type = 'text',
}: TextInputStepProps) {
  const value = stepData[field] as string | number | undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-[var(--text-primary)]">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={field}
        name={field}
        type={type}
        value={value ?? ''}
        onChange={(e) => updateStepData(field, e.target.value)}
        placeholder={placeholder}
        className="bg-[var(--input)] border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
        required={required}
      />
      {description && <p className="text-xs text-[var(--text-muted)]">{description}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Textarea Step
// ═══════════════════════════════════════════════════════════════
interface TextareaStepProps {
  stepData: Record<string, string | number | boolean | null>;
  updateStepData: (key: string, value: string | number | boolean | null) => void;
  field: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  rows?: number;
}

export function TextareaStep({
  stepData,
  updateStepData,
  field,
  label,
  placeholder,
  description,
  required = false,
  rows = 4,
}: TextareaStepProps) {
  const value = stepData[field] as string | number | undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-[var(--text-primary)]">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        id={field}
        name={field}
        value={value ?? ''}
        onChange={(e) => updateStepData(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="bg-[var(--input)] border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none"
        required={required}
      />
      {description && <p className="text-xs text-[var(--text-muted)]">{description}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Select Step
// ═══════════════════════════════════════════════════════════════
interface SelectStepProps {
  stepData: Record<string, string | number | boolean | null>;
  updateStepData: (key: string, value: string | number | boolean | null) => void;
  field: string;
  label: string;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  placeholder?: string;
  description?: string;
  required?: boolean;
  defaultValue?: string;
}

export function SelectStep({
  stepData,
  updateStepData,
  field,
  label,
  options,
  placeholder = 'Select...',
  description,
  required = false,
}: SelectStepProps) {
  const value = stepData[field] as string | undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-[var(--text-primary)]">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={value ?? ''}
        onValueChange={(value) => updateStepData(field, value)}
        required={required}
      >
        <SelectTrigger className="bg-[var(--input)] border-[var(--input-border)] text-[var(--text-primary)]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-[var(--text-primary)]"
            >
              <div className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <p className="text-xs text-[var(--text-muted)]">{description}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Card Selection Step
// ═══════════════════════════════════════════════════════════════
interface CardSelectionStepProps {
  stepData: Record<string, string | number | boolean | null>;
  updateStepData: (key: string, value: string | number | boolean | null) => void;
  field: string;
  label: string;
  options: {
    value: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color?: string;
  }[];
  description?: string;
  required?: boolean;
  columns?: 2 | 3 | 4;
}

export function CardSelectionStep({
  stepData,
  updateStepData,
  field,
  label,
  options,
  description,
  required = false,
  columns = 2,
}: CardSelectionStepProps) {
  const selectedValue = stepData[field];

  return (
    <div className="space-y-2 md:space-y-3">
      <div>
        <Label className="text-[var(--text-primary)] text-sm md:text-base">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {description && <p className="text-[10px] md:text-xs text-[var(--text-muted)] mt-1">{description}</p>}
      </div>

      <div
        className={cn(
          'grid gap-2 md:gap-3',
          'grid-cols-1 sm:grid-cols-2',
          columns === 3 && 'md:grid-cols-3',
          columns === 4 && 'md:grid-cols-4',
        )}
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.value;

          return (
            <Card
              key={option.value}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                isSelected
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-md'
                  : 'border-[var(--border)] bg-[var(--background)] hover:bg-[var(--background-subtle)]',
              )}
              onClick={() => updateStepData(field, option.value)}
            >
              <CardContent className="p-3 md:p-5 flex flex-col items-center text-center gap-2 md:gap-3">
                <div
                  className={cn(
                    'p-2 md:p-3 rounded-full transition-colors',
                    isSelected
                      ? 'bg-[var(--primary)] text-white'
                      : option.color || 'bg-[var(--background-subtle)] text-[var(--text-muted)]',
                  )}
                >
                  {React.isValidElement(option.icon) ? React.cloneElement(option.icon as React.ReactElement<any>, { className: 'w-4 h-4 md:w-6 md:h-6' }) : option.icon}
                </div>
                <div className="space-y-1 md:space-y-1.5">
                  <p
                    className={cn(
                      'font-semibold text-xs md:text-sm leading-tight',
                      isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]',
                    )}
                  >
                    {option.title}
                  </p>
                  <p className="text-[10px] md:text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">{option.description}</p>
                </div>
                {isSelected && <Badge className="bg-[var(--primary)] text-white text-[10px] md:text-xs px-2 py-0.5">✓ Выбрано</Badge>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Radio Group Step
// ═══════════════════════════════════════════════════════════════
interface RadioGroupStepProps {
  stepData: Record<string, string | number | boolean | null>;
  updateStepData: (key: string, value: string | number | boolean | null) => void;
  field: string;
  label: string;
  options: { value: string; label: string; description?: string }[];
  description?: string;
  required?: boolean;
}

export function RadioGroupStep({
  stepData,
  updateStepData,
  field,
  label,
  options,
  description,
  required = false,
}: RadioGroupStepProps) {
  const value = stepData[field] as string | undefined;
  return (
    <div className="space-y-2 md:space-y-3">
      <div>
        <Label className="text-[var(--text-primary)] text-sm md:text-base">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {description && <p className="text-[10px] md:text-xs text-[var(--text-muted)] mt-1">{description}</p>}
      </div>

      <RadioGroup
        value={value ?? ''}
        onValueChange={(value) => updateStepData(field, value)}
        className="space-y-2"
      >
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-start space-x-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--background-subtle)] transition-colors cursor-pointer"
            onClick={() => updateStepData(field, option.value)}
          >
            <RadioGroupItem
              value={option.value}
              id={`${field}-${option.value}`}
              className="mt-0.5"
            />
            <Label htmlFor={`${field}-${option.value}`} className="flex-1 cursor-pointer">
              <p className="font-medium text-[var(--text-primary)]">{option.label}</p>
              {option.description && (
                <p className="text-xs text-[var(--text-muted)] mt-1">{option.description}</p>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Checkbox Step
// ═══════════════════════════════════════════════════════════════
interface CheckboxStepProps {
  stepData: Record<string, string | number | boolean | null | string[]>;
  updateStepData: (key: string, value: string | number | boolean | null | string[]) => void;
  field: string;
  label: string;
  options: { value: string; label: string; description?: string }[];
  description?: string;
}

export function CheckboxStep({
  stepData,
  updateStepData,
  field,
  label,
  options,
  description,
}: CheckboxStepProps) {
  const values = (stepData[field] as string[] | undefined) || [];

  const toggleValue = (value: string) => {
    const newValues = values.includes(value)
      ? values.filter((v: string) => v !== value)
      : [...values, value];
    updateStepData(field, newValues);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-[var(--text-primary)] text-base">{label}</Label>
        {description && <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>}
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const isChecked = values.includes(option.value);

          return (
            <div
              key={option.value}
              className="flex items-start space-x-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--background-subtle)] transition-colors cursor-pointer"
              onClick={() => toggleValue(option.value)}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => toggleValue(option.value)}
                id={`${field}-${option.value}`}
              />
              <Label htmlFor={`${field}-${option.value}`} className="flex-1 cursor-pointer">
                <p className="font-medium text-[var(--text-primary)]">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-1">{option.description}</p>
                )}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
