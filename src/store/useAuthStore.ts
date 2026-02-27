import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  role: 'superadmin' | 'admin' | 'supervisor' | 'employee'
  avatar?: string
  department?: string
  position?: string
  employeeType?: 'staff' | 'contractor'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Actions
  setUser: (user: User) => void
  setToken: (token: string) => void
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user: User) =>
        set({ user, isAuthenticated: true }),

      setToken: (token: string) =>
        set({ token }),

      login: (user: User) =>
        set({ user, isAuthenticated: true }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
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
