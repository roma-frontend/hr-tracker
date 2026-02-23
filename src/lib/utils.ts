import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, eachDayOfInterval, isWeekend } from 'date-fns'

// ─── Tailwind class merger ───────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date utilities ──────────────────────────────────────────────────────────

/**
 * Format a date to a human-readable string.
 * @example formatDate(new Date()) // "Jun 15, 2025"
 */
export function formatDate(date: Date | string | number): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

/**
 * Calculate the number of business days (Mon–Fri) between two dates, inclusive.
 */
export function calculateDays(start: Date | string, end: Date | string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)

  if (startDate > endDate) return 0

  const allDays = eachDayOfInterval({ start: startDate, end: endDate })
  return allDays.filter((day) => !isWeekend(day)).length
}

// ─── Travel allowance ────────────────────────────────────────────────────────

/**
 * Returns travel allowance amount in AMD.
 * Contractors receive 12,000 AMD; regular employees receive 20,000 AMD.
 */
export function getTravelAllowance(email: string): number {
  return email.toLowerCase().includes('contractor') ? 12000 : 20000
}

// ─── Leave type helpers ──────────────────────────────────────────────────────

export type LeaveType =
  | 'annual'
  | 'sick'
  | 'personal'
  | 'maternity'
  | 'paternity'
  | 'unpaid'
  | 'bereavement'
  | 'study'

const LEAVE_TYPE_COLORS: Record<LeaveType | string, string> = {
  annual: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400',
  sick: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400',
  personal: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
  maternity: 'text-pink-600 bg-pink-50 dark:bg-pink-950 dark:text-pink-400',
  paternity: 'text-violet-600 bg-violet-50 dark:bg-violet-950 dark:text-violet-400',
  unpaid: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
  bereavement: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
  study: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400',
}

/**
 * Returns a Tailwind color class string for the given leave type.
 */
export function getLeaveTypeColor(type: LeaveType | string): string {
  return LEAVE_TYPE_COLORS[type.toLowerCase()] ?? LEAVE_TYPE_COLORS['personal']
}

const LEAVE_TYPE_BADGE_VARIANTS: Record<LeaveType | string, string> = {
  annual: 'success',
  sick: 'destructive',
  personal: 'default',
  maternity: 'secondary',
  paternity: 'outline',
  unpaid: 'secondary',
  bereavement: 'secondary',
  study: 'warning',
}

/**
 * Returns a badge variant string for use with shadcn/ui Badge component.
 */
export function getLeaveTypeBadgeVariant(type: LeaveType | string): string {
  return LEAVE_TYPE_BADGE_VARIANTS[type.toLowerCase()] ?? 'default'
}

// ─── Currency formatter ──────────────────────────────────────────────────────

/**
 * Formats a number as AMD (Armenian Dram) currency.
 * @example formatCurrency(20000) // "֏20,000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('hy-AM', {
    style: 'currency',
    currency: 'AMD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
