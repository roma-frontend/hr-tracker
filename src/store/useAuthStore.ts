import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import React from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

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
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  isLoading: boolean;

  setUser: (user: UserProfile) => void;
  setSupabaseUser: (user: SupabaseUser | null) => void;
  setSession: (session: Session | null) => void;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  checkOnboarding: () => void;
  initialize: () => Promise<void>;
}

async function fetchUserProfile(supabaseUserId: string, userEmail?: string): Promise<UserProfile | null> {
  // First try by ID (primary key match)
  let { data, error } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      role,
      employee_type,
      department,
      position,
      phone,
      avatar_url,
      presence_status,
      is_active,
      is_approved,
      "organizationId",
      organizations (
        id,
        name,
        slug
      )
    `)
    .eq('id', supabaseUserId)
    .maybeSingle();

  // Fallback: try by email
  if (!data && userEmail) {
    const normalizedEmail = userEmail.toLowerCase().trim();
    const { data: emailData } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        employee_type,
        department,
        position,
        phone,
        avatar_url,
        presence_status,
        is_active,
        is_approved,
        "organizationId",
        organizations (
          id,
          name,
          slug
        )
      `)
      .eq('email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (emailData) {
      data = emailData;
    }
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    avatar: data.avatar_url || undefined,
    department: data.department || undefined,
    position: data.position || undefined,
    employeeType: data.employee_type || undefined,
    organizationId: data.organizationId || undefined,
    organizationSlug: data.organizations?.slug || undefined,
    organizationName: data.organizations?.name || undefined,
    isApproved: data.is_approved,
    phone: data.phone || undefined,
    presenceStatus: data.presence_status || undefined,
  };
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  supabaseUser: null,
  session: null,
  isAuthenticated: false,
  needsOnboarding: false,
  isLoading: true,

  setUser: (user: UserProfile) => {
    const needsOnboarding = !user.organizationId || !user.isApproved;
    set({ user, needsOnboarding });
  },

  setSupabaseUser: (supabaseUser: SupabaseUser | null) => {
    set({ supabaseUser });
  },

  setSession: (session: Session | null) => {
    set({ session });
  },

  login: (user: UserProfile) => {
    const needsOnboarding = !user.organizationId || !user.isApproved;
    set({ user, isAuthenticated: true, needsOnboarding });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      supabaseUser: null,
      session: null,
      isAuthenticated: false,
      needsOnboarding: false,
    });
  },

  checkOnboarding: () => {
    const { user } = get();
    const needsOnboarding = !user?.organizationId || !user?.isApproved;
    set({ needsOnboarding });
  },

  initialize: async () => {
    // Don't reinitialize if we already have a valid user (e.g., from login page)
    const current = get();
    if (current.user && current.isAuthenticated) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      set({ session, supabaseUser: session.user });

      const profile = await fetchUserProfile(session.user.id, session.user.email);

      if (profile) {
        const needsOnboarding = !profile.organizationId || !profile.isApproved;
        set({
          user: profile,
          isAuthenticated: true,
          needsOnboarding,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        set({ session, supabaseUser: session.user });

        const profile = await fetchUserProfile(session.user.id, session.user.email);

        if (profile) {
          const needsOnboarding = !profile.organizationId || !profile.isApproved;
          set({
            user: profile,
            isAuthenticated: true,
            needsOnboarding,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        set({
          user: null,
          supabaseUser: null,
          session: null,
          isAuthenticated: false,
          needsOnboarding: false,
        });
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        set({ session });
      } else if (event === 'USER_UPDATED' && session?.user) {
        set({ session, supabaseUser: session.user });

        const profile = await fetchUserProfile(session.user.id, session.user.email);
        if (profile) {
          const needsOnboarding = !profile.organizationId || !profile.isApproved;
          set({ user: profile, needsOnboarding });
        }
      }
    });
  },
}));

export function useAuthStoreShallow() {
  const user = useAuthStore(useShallow((state) => state.user));
  const isAuthenticated = useAuthStore(useShallow((state) => state.isAuthenticated));
  const needsOnboarding = useAuthStore(useShallow((state) => state.needsOnboarding));
  const isLoading = useAuthStore(useShallow((state) => state.isLoading));

  return React.useMemo(
    () => ({
      user,
      isAuthenticated,
      needsOnboarding,
      isLoading,
    }),
    [user, isAuthenticated, needsOnboarding, isLoading],
  );
}

export const useAuthUser = (): UserProfile | null =>
  useAuthStore(useShallow((state) => state.user));
export const useAuthIsAuthenticated = () =>
  useAuthStore(useShallow((state) => state.isAuthenticated));
export const useAuthNeedsOnboarding = () =>
  useAuthStore(useShallow((state) => state.needsOnboarding));
export const useAuthIsLoading = () =>
  useAuthStore(useShallow((state) => state.isLoading));
export const useAuthLogout = () => useAuthStore((state) => state.logout);
export const useAuthInitialize = () => useAuthStore((state) => state.initialize);
