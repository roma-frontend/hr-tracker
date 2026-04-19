import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { createClient } from '@/lib/supabase/server';

/**
 * Verify JWT auth token.
 */
async function verifyAuth(): Promise<{ userId: string; role: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('hr-auth-token') || cookieStore.get('oauth-session');
    if (!token) return null;

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return null;

    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token.value, secret);
    return { userId: payload.sub as string, role: (payload.role as string) || 'employee' };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // SECURITY: Require authentication
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, event, details } = await req.json();
    if (!userId || !event) {
      return NextResponse.json({ error: 'Missing userId or event' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from('login_attempts').insert({
      email: '',
      userid: userId,
      success: false,
      method: 'password',
      blocked_reason: `${event}: ${details ?? ''}`,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown',
      user_agent: req.headers.get('user-agent') ?? undefined,
      risk_score: 90,
      risk_factors: [event],
      created_at: Date.now(),
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
