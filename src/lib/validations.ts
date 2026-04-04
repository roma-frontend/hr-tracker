/**
 * Validation schemas using Zod + React Hook Form
 *
 * Centralized validation schemas for all forms in the application.
 * Reusable, type-safe, and consistent across the codebase.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// COMMON SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^\+?[\d\s()-]+$/, 'Invalid phone number format');

export const emailSchema = z.string().email('Invalid email address');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters');

export const dateSchema = z
  .string()
  .min(1, 'Date is required')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ─────────────────────────────────────────────────────────────────────────────
// AUTH FORMS
// ─────────────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE REQUEST FORMS
// ─────────────────────────────────────────────────────────────────────────────

export const leaveRequestSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  leaveType: z.enum(['vacation', 'sick', 'personal', 'unpaid', 'other']),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
  attachmentUrl: z.string().optional(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEE FORMS
// ─────────────────────────────────────────────────────────────────────────────

export const employeeSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  role: z.enum(['employee', 'supervisor', 'admin']),
  employeeType: z.enum(['full-time', 'part-time', 'contractor']).default('full-time'),
  startDate: z.string().min(1, 'Start date is required'),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER REQUEST FORMS
// ─────────────────────────────────────────────────────────────────────────────

export const driverRequestSchema = z.object({
  driverId: z.string().min(1, 'Driver is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  from: z.string().min(1, 'Pickup location is required'),
  to: z.string().min(1, 'Destination is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  passengerCount: z.coerce.number().min(1).max(10),
  notes: z.string().max(500).optional(),
  requiresApproval: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export type DriverRequestFormData = z.infer<typeof driverRequestSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATION FORMS
// ─────────────────────────────────────────────────────────────────────────────

export const organizationSchema = z.object({
  name: nameSchema,
  domain: z.string().min(1, 'Domain is required').regex(/^[a-zA-Z0-9.-]+$/, 'Invalid domain format'),
  adminName: nameSchema,
  adminEmail: emailSchema,
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// TASK FORMS
// ─────────────────────────────────────────────────────────────────────────────

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  assigneeId: z.string().min(1, 'Assignee is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type TaskFormData = z.infer<typeof taskSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// EVENT FORMS
// ─────────────────────────────────────────────────────────────────────────────

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  location: z.string().max(200).optional(),
  type: z.enum(['meeting', 'holiday', 'reminder', 'custom']).default('meeting'),
});

export type EventFormData = z.infer<typeof eventSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS / PROFILE FORMS
// ─────────────────────────────────────────────────────────────────────────────

export const profileSchema = z.object({
  name: nameSchema,
  phone: phoneSchema.optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const settingsSchema = z.object({
  notifications: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  language: z.enum(['en', 'ru', 'hy']).default('en'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
