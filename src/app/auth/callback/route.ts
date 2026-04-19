import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const supabaseService = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: existingProfile } = await supabaseService
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
          .eq('id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!existingProfile) {
          const { data: org } = await supabaseService
            .from('organizations')
            .select('id')
            .limit(1)
            .single();

          const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

          if (org) {
            await supabaseService.from('users').insert({
              id: user.id,
              "organizationId": org.id,
              name: userName,
              email: user.email?.toLowerCase(),
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
            });
          } else {
            await supabaseService.from('users').insert({
              id: user.id,
              name: userName,
              email: user.email?.toLowerCase(),
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
            });
          }
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`);
}
