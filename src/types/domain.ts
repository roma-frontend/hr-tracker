/**
 * Shared domain types for the HR Office platform
 * Centralizes type definitions used across stores, components, and API
 */

export interface User {
  id: string;
  organizationId?: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'supervisor' | 'employee' | 'driver';
  employeeType: 'staff' | 'contractor';
  department?: string;
  position?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: number;
  updatedAt?: number;
  lastLoginAt?: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'professional' | 'enterprise';
  isActive: boolean;
  country?: string;
  timezone?: string;
  industry?: string;
  createdAt: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  organizationId?: string;
  type: 'paid' | 'unpaid' | 'sick' | 'family' | 'doctor';
  status: 'pending' | 'approved' | 'rejected';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  isRead: boolean;
  createdAt: number;
  reviewedAt?: number;
  reviewerId?: string;
  reviewComment?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedBy?: string;
  organizationId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  createdAt: number;
  completedAt?: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  organizationId?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  location?: string;
  notes?: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  price?: number;
  currentPeriodEnd?: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  createdAt: number;
  updatedAt?: number;
}

export interface SupervisorRating {
  id: string;
  employeeId: string;
  supervisorId: string;
  organizationId?: string;
  overallRating: number;
  qualityOfWork: number;
  efficiency: number;
  teamwork: number;
  initiative: number;
  communication: number;
  reliability: number;
  ratingPeriod: string;
  strengths?: string;
  weaknesses?: string;
  createdAt: number;
}
