import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function auth() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('hr-auth-token')?.value;

  if (jwt) {
    const payload = await verifyJWT(jwt);
    if (payload) {
      return {
        user: {
          id: payload.userId,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          department: payload.department,
          position: payload.position,
          employeeType: payload.employeeType,
          avatar: payload.avatar,
          organizationId: payload.organizationId,
          organizationSlug: payload.organizationSlug,
          organizationName: payload.organizationName,
          isApproved: payload.isApproved,
        },
      };
    }
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name,
        role: session.user.user_metadata?.role || 'employee',
      },
    };
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  if (provider === 'google') {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (data.url) {
      return NextResponse.redirect(data.url);
    }
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (email && password) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name,
      },
      session: data.session,
    });
  }

  return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
}
