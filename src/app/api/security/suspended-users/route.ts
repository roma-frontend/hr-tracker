import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, avatar_url, is_suspended, suspended_until, suspended_reason')
      .eq('is_suspended', true)
      .gt('suspended_until', Date.now());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      users: (users || []).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatarUrl: u.avatar_url,
        suspendedReason: u.suspended_reason,
        suspendedUntil: u.suspended_until,
      })),
    });
  } catch (error) {
    console.error('[Suspended Users API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
