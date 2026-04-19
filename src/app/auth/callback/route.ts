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
          .select('*')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          const { data: org } = await supabaseService
            .from('organizations')
            .select('id')
            .limit(1)
            .single();

          if (org) {
            await supabaseService.from('users').insert({
              id: user.id,
              organizationid: org.id,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email,
              password_hash: '',
              role: 'superadmin',
              is_active: true,
              is_approved: true,
              presence_status: 'available',
            });
          }
        } else if (existingProfile.role !== 'superadmin') {
          await supabaseService
            .from('users')
            .update({ role: 'superadmin' })
            .eq('id', user.id);
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
