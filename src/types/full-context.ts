/**
 * Type definitions for full-context API response data.
 * These interfaces replace `any` casts when processing API responses.
 */

export interface ContextEmployee {
  id: string;
  name: string;
  email?: string;
  role: string;
  department: string;
  position: string;
  employeeType?: string;
  presenceStatus: string;
  currentLeave: {
    leaveId?: string;
    type: string;
    startDate: string;
    endDate: string;
    reason?: string;
    status?: string;
  } | null;
  todayStatus: {
    status: string;
    checkIn?: string | null;
    checkOut?: string | null;
    isLate?: boolean;
    lateMinutes?: number;
    workedHours?: string | null;
  } | null;
  leaveBalance?: {
    paid: number;
    sick: number;
    family: number;
    unpaid: number;
  };
  upcomingLeaves: {
    leaveId?: string;
    type: string;
    startDate: string;
    endDate: string;
    days?: number;
    status: string;
  }[];
  pendingLeaves: {
    leaveId?: string;
    type: string;
    startDate: string;
    endDate: string;
    days?: number;
    status: string;
  }[];
  allLeaves: {
    leaveId?: string;
    type: string;
    startDate: string;
    endDate: string;
    days?: number;
    status: string;
    reason?: string;
  }[];
  totalLeavesTaken: number;
  supervisorName?: string | null;
  tasks: {
    taskId: string;
    title: string;
    status: string;
    priority: string;
    deadline: string | null;
    assignedBy: string;
  }[];
}

export interface ContextCalendarEvent {
  employee: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  days?: number;
}

export interface ContextAttendanceRecord {
  name: string;
  department: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  isLate?: boolean;
  lateMinutes?: number;
}

export interface ContextTicket {
  ticketId: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdBy: string;
  assignedTo?: string | null;
  createdAt: string;
  isOverdue?: boolean;
}

export interface ContextTicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  critical: number;
}

export interface ContextCompanyEvent {
  eventId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  eventType: string;
  priority: string;
  createdBy: string;
  requiredDepartments?: string[];
}

export interface ContextAutomationWorkflow {
  workflowId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface ContextDriverRequest {
  requestId: string;
  status: string;
  pickupLocation: string;
  dropoffLocation: string;
  requestedBy: string;
  scheduledFor: string;
}

export interface ContextAvailableDriver {
  driverId: string;
  name: string;
  vehicle?: string;
  status: string;
}

export interface ContextSurvey {
  surveyId: string;
  title: string;
  description: string;
  status: string;
  isAnonymous: boolean;
  startsAt: string;
  endsAt: string;
  createdBy: string;
  responseCount: number;
}

export interface FullContextResponse {
  employees: ContextEmployee[];
  calendarEvents: ContextCalendarEvent[];
  todayAttendance: ContextAttendanceRecord[];
  totalEmployees: number;
  currentlyAtWork: number;
  onLeaveToday: number;
  tickets: ContextTicket[];
  ticketStats: ContextTicketStats;
  companyEvents: ContextCompanyEvent[];
  automationWorkflows: ContextAutomationWorkflow[];
  driverRequests: ContextDriverRequest[];
  availableDrivers: ContextAvailableDriver[];
  surveys: ContextSurvey[];
  goals: unknown[];
  myGoals: unknown[];
  kudosFeed: unknown[];
  leaderboard: unknown[];
  corporateDocs: unknown[];
  performanceReviews: unknown[];
  unreadMessages: number;
  unreadConversations: unknown[];
  unreadNotifications: number;
  unreadLeaveApprovals: number;
  error?: string;
}
