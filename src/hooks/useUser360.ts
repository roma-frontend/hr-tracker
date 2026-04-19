import { useQuery } from '@tanstack/react-query';

export interface User360Data {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    position?: string;
    phone?: string;
    location?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
    isActive: boolean;
    isApproved: boolean;
  };
  organization: {
    id: string;
    name: string;
  } | null;
  leaves: Array<{
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    status: string;
    reason: string;
    reviewComment?: string;
    reviewerName?: string;
    createdAt: number;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority?: string;
    deadline?: string;
    createdAt: number;
  }>;
  driverRequests: Array<{
    id: string;
    status: string;
    priority?: string;
    startTime: number;
    tripInfo?: {
      from: string;
      to: string;
      purpose?: string;
    };
    driverName?: string;
    driverPhone?: string;
  }>;
  supportTickets: Array<{
    id: string;
    ticketNumber: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: number;
  }>;
  stats: {
    totalLeaves: number;
    pendingLeaves: number;
    approvedLeaves: number;
    totalTasks: number;
    completedTasks: number;
    totalDriverRequests: number;
    totalTickets: number;
    totalLoginAttempts: number;
  };
  loginAttempts: Array<{
    id: string;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    authMethod?: string;
    riskScore?: number;
    createdAt: number;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: number;
  }>;
  chatMessages: Array<{
    id: string;
    content: string;
    type: string;
    createdAt: number;
  }>;
}

export function useUser360(userId: string) {
  return useQuery({
    queryKey: ['superadmin', 'user-360', userId],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'get-user-360',
        userId,
      });
      const res = await fetch(`/api/superadmin?${params}`);
      if (!res.ok) throw new Error('Failed to fetch user 360 data');
      const json = await res.json();
      return json.data as User360Data;
    },
    enabled: !!userId,
  });
}
