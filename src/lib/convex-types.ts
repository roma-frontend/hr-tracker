import { Id } from '@/../convex/_generated/dataModel';

export interface User {
  _id: Id<'users'>;
  _creationTime: number;
  name: string;
  email: string;
  organizationId?: Id<'organizations'>;
  role: 'admin' | 'manager' | 'staff' | 'superadmin';
  department?: string;
  employeeType?: 'full-time' | 'part-time' | 'contract' | 'staff';
  avatarUrl?: string;
  passwordHash?: string;
  loginAttempts?: number;
  lastLoginAt?: number;
  isMfaEnabled?: boolean;
  totpSecret?: string;
  webAuthnCredentials?: Array<{
    credentialId: string;
    publicKey: string;
    counter: number;
  }>;
  faceEncodingUrl?: string;
  workdayStart?: number;
  workdayEnd?: number;
  workingDays?: number[];
  timezone?: string;
  language?: 'en' | 'ru' | 'hy';
  createdAt: number;
  updatedAt: number;
}

export interface Leave {
  _id: Id<'leaveRequests'>;
  _creationTime: number;
  organizationId: Id<'organizations'>;
  userId: Id<'users'>;
  type: 'paid' | 'unpaid' | 'sick' | 'family' | 'doctor';
  status: 'pending' | 'approved' | 'rejected';
  startDate: string;
  endDate: string;
  reason?: string;
  reviewedBy?: Id<'users'>;
  reviewedAt?: number;
  rejectionReason?: string;
  duration?: number;
  createdAt: number;
  updatedAt: number;

  // Enriched fields from backend
  userName?: string;
  userEmail?: string;
  userDepartment?: string;
  userEmployeeType?: 'full-time' | 'part-time' | 'contract' | 'staff';
  userAvatarUrl?: string;
  reviewerName?: string;
}

export interface Organization {
  _id: Id<'organizations'>;
  _creationTime: number;
  name: string;
  slug: string;
  plan: 'starter' | 'professional' | 'enterprise';
  isActive: boolean;
  createdBySuperadmin?: boolean;
  logoUrl?: string;
  primaryColor?: string;
  timezone?: string;
  country?: string;
  industry?: string;
  employeeLimit: number;
  createdAt: number;
  updatedAt: number;
}

export interface Event {
  _id: Id<'companyEvents'>;
  _creationTime: number;
  organizationId: Id<'organizations'>;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isPublicHoliday?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MaintenanceMode {
  _id: Id<'maintenanceMode'>;
  _creationTime: number;
  organizationId?: Id<'organizations'>;
  isActive: boolean;
  startTime: number;
  endTime?: number;
  reason?: string;
  createdAt: number;
  updatedAt: number;
}

export interface LeaveEnriched extends Omit<Leave, 'userEmployeeType'> {
  userName: string;
  userEmail: string;
  userDepartment: string;
  userEmployeeType?: string;
  userAvatarUrl?: string;
  reviewerName?: string;
}
