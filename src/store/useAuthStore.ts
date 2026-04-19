import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import React from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'supervisor' | 'employee' | 'driver';
  avatar?: string | null;
  department?: string | null;
  position?: string | null;
  employeeType?: 'staff' | 'contractor';
  organizationId?: string | null;
  organizationSlug?: string | null;
  organizationName?: string | null;
  isApproved?: boolean;
  phone?: string | null;
  presenceStatus?: 'available' | 'in_meeting' | 'in_call' | 'out_of_office' | 'busy';
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;

  setUser: (user: UserProfile) => void;
  login: (user: UserProfile) => void;
  logout: () => void;
  checkOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      needsOnboarding: false,

      setUser: (user: UserProfile) => {
        // Superadmin doesn't need an organization
        const needsOnboarding = user.role !== 'superadmin' && (!user.organizationId || !user.isApproved);
        set({ user, isAuthenticated: true, needsOnboarding });
      },

      login: (user: UserProfile) => {
        // Superadmin doesn't need an organization
        const needsOnboarding = user.role !== 'superadmin' && (!user.organizationId || !user.isApproved);
        set({ user, isAuthenticated: true, needsOnboarding });
      },

      checkOnboarding: () => {
        const { user } = get();
        const needsOnboarding = !user?.organizationId || !user?.isApproved;
        set({ needsOnboarding });
      },

      logout: () => {
        // Clear Zustand state
        set({ user: null, isAuthenticated: false, needsOnboarding: false });
        // Clear httpOnly cookies via API call
        if (typeof window !== 'undefined') {
          fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export function useAuthStoreShallow() {
  const user = useAuthStore(useShallow((state) => state.user));
  const isAuthenticated = useAuthStore(useShallow((state) => state.isAuthenticated));
  const needsOnboarding = useAuthStore(useShallow((state) => state.needsOnboarding));

  return React.useMemo(
    () => ({
      user,
      isAuthenticated,
      needsOnboarding,
    }),
    [user, isAuthenticated, needsOnboarding],
  );
}

export const useAuthUser = (): UserProfile | null =>
  useAuthStore(useShallow((state) => state.user));
export const useAuthIsAuthenticated = () =>
  useAuthStore(useShallow((state) => state.isAuthenticated));
export const useAuthNeedsOnboarding = () =>
  useAuthStore(useShallow((state) => state.needsOnboarding));
export const useAuthLogout = () => useAuthStore((state) => state.logout);
export const useAuthInitialize = () => useAuthStore((state) => state.initialize);
