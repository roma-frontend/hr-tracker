'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase/client';

function extractUserName(user: any): string {
  return user.user_metadata?.name?.trim() || user.email?.split('@')[0] || 'User';
}


export function useAuthSync() {
  const { login, isAuthenticated, initialize } = useAuthStore();
  const initializedRef = useRef(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const prevUserState = useRef<{ organizationId?: string | null; isApproved?: boolean }>({});

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    initialize();
  }, [initialize]);

  useEffect(() => {
    const syncAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        if (isAuthenticated) return;
        setUserEmail(null);
        return;
      }

      if (userEmail !== session.user.email) {
        try {
          const finalName = extractUserName(session.user);
          const { data: existingUser } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', session.user.email!)
            .single();

          if (!existingUser) {
            const { data: newUser } = await supabase
              .from('users')
              .insert({
                email: session.user.email!,
                name: finalName,
                password_hash: 'oauth',
                role: 'employee',
                employee_type: 'staff',
                is_active: true,
                is_approved: false,
                travel_allowance: 0,
                paid_leave_balance: 20,
                sick_leave_balance: 10,
                family_leave_balance: 5,
                created_at: Math.floor(Date.now() / 1000),
                updated_at: Math.floor(Date.now() / 1000),
              })
              .select()
              .single();

            if (newUser) {
              setUserEmail(session.user.email!);
            }
          } else {
            setUserEmail(session.user.email!);
          }
        } catch (error) {
          console.error('[useAuthSync] Error syncing OAuth user:', error);
        }
      }
    };

    syncAuth();
  }, [isAuthenticated, userEmail]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Skip if we already have a valid user in store (login page already set it)
        const currentState = useAuthStore.getState();
        if (currentState.user && currentState.user.email === session.user.email) {
          return;
        }

        const profile = await supabase
          .from('users')
          .select(`
            id,
            name,
            email,
            role,
            employee_type,
            department,
            position,
            avatar_url,
            is_approved,
            organizationId,
            organizations (
              id,
              name,
              slug
            )
          `)
          .eq('email', session.user.email!)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (profile.data) {
          const finalName = profile.data.name || extractUserName(session.user);

          login({
            id: profile.data.id,
            name: finalName,
            email: profile.data.email,
            role: profile.data.role,
            avatar: profile.data.avatar_url || undefined,
            department: profile.data.department || undefined,
            position: profile.data.position || undefined,
            employeeType: profile.data.employee_type || undefined,
            organizationId: profile.data.organizationId || undefined,
            organizationSlug: profile.data.organizations?.slug || undefined,
            organizationName: profile.data.organizations?.name || undefined,
            isApproved: profile.data.is_approved,
          });

          prevUserState.current = {
            organizationId: profile.data.organizationId,
            isApproved: profile.data.is_approved,
          };
        }
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.getState().logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [login]);

  return { userEmail };
}
