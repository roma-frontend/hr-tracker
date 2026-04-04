import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: 'superadmin' | 'admin' | 'supervisor' | 'employee';
    organizationId?: string;
    isApproved?: boolean;
    department?: string;
    position?: string;
    employeeType?: string;
    avatar?: string;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    organizationId?: string;
    isApproved?: boolean;
    department?: string;
    position?: string;
    employeeType?: string;
    avatar?: string;
  }
}
