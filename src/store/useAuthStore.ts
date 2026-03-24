import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import React from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: 'superadmin' | 'admin' | 'supervisor' | 'employee' | 'driver'
  avatar?: string
  department?: string
  position?: string
  employeeType?: 'staff' | 'contractor'
  organizationId?: string
  isApproved?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  needsOnboarding: boolean

  // Actions
  setUser: (user: User) => void
  setToken: (token: string) => void
  login: (user: User) => void
  logout: () => void
  checkOnboarding: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      needsOnboarding: false,

      setUser: (user: User) => {
        const needsOnboarding = !user.organizationId || !user.isApproved;
        set({ user, isAuthenticated: true, needsOnboarding })
      },

      setToken: (token: string) =>
        set({ token }),

      login: (user: User) => {
        const needsOnboarding = !user.organizationId || !user.isApproved;
        set({ user, isAuthenticated: true, needsOnboarding })
      },

      checkOnboarding: () => {
        const { user } = get();
        const needsOnboarding = !user?.organizationId || !user?.isApproved;
        set({ needsOnboarding })
      },

      logout: () => {
        // Clear Zustand state
        set({ user: null, token: null, isAuthenticated: false, needsOnboarding: false });
        // Also clear localStorage to prevent hydration of stale data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('hr-auth-storage');
        }
        console.log("[Auth] Logout: Cleared Zustand state and localStorage");
      },
    }),
    {
      name: 'hr-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: true,
    }
  )
)

/**
 * Оптимизированный хук для использования auth store с shallow comparison
 * Предотвращает лишние ре-рендеры при изменении несвязанных полей
 *
 * @example
 * const { user, isAuthenticated } = useAuthStoreShallow();
 */
export function useAuthStoreShallow() {
  const user = useAuthStore((state) => state.user, shallow)
  const token = useAuthStore((state) => state.token, shallow)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated, shallow)
  const needsOnboarding = useAuthStore((state) => state.needsOnboarding, shallow)
  
  return React.useMemo(() => ({
    user,
    token,
    isAuthenticated,
    needsOnboarding,
  }), [user, token, isAuthenticated, needsOnboarding])
}

/**
 * Селекторы для отдельных полей store
 * Используем для максимальной оптимизации ре-рендеров
 */
export const useAuthUser = (): User | null => useAuthStore((state) => state.user, shallow)
export const useAuthIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated, shallow)
export const useAuthNeedsOnboarding = () => useAuthStore((state) => state.needsOnboarding, shallow)
export const useAuthLogout = () => useAuthStore((state) => state.logout)
