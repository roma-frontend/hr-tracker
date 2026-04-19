import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix');
    const userId = searchParams.get('userId');
    const superadminId = searchParams.get('superadminId');
    const limit = searchParams.get('limit') || '20';

    if (prefix) {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, role, avatar_url, organizationId')
        .or(`name.ilike.%${prefix}%,email.ilike.%${prefix}%`)
        .limit(20);

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
          organizationId: u.organizationId,
        })),
      });
    }

    if (userId) {
      const { data: session, error } = await (supabase as any)
        .from('impersonation_sessions')
        .select(
          `
          id,
          is_active,
          reason,
          started_at,
          ended_at,
          expires_at,
          superadminid,
          target_userid,
          organization_id,
          users!impersonation_sessions_superadminid_fkey (name, email),
          users!impersonation_sessions_target_userid_fkey (name, email),
          organizations!impersonation_sessions_organization_id_fkey (name)
        `,
        )
        .eq('superadminid', userId)
        .eq('is_active', true)
        .gt('expires_at', Date.now())
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!session) {
        return NextResponse.json({ session: null });
      }

      const superadmin = session.users?.[0] || session.users;
      const targetUser = session.users?.[1] || (session.users && session.users.length > 1 ? session.users[1] : null);
      const org = session.organizations;

      return NextResponse.json({
        session: {
          id: session.id,
          sessionId: session.id,
          isActive: session.is_active,
          superadminName: superadmin?.name,
          targetUserName: targetUser?.name,
          targetUserEmail: targetUser?.email,
          organizationName: org?.name,
          reason: session.reason,
          startedAt: session.started_at,
          endedAt: session.ended_at,
          duration: session.ended_at ? session.ended_at - session.started_at : 0,
          expiresAt: session.expires_at,
          targetUser: {
            name: targetUser?.name,
            email: targetUser?.email,
          },
        },
      });
    }

    if (superadminId) {
      const { data: sessions, error } = await (supabase as any)
        .from('impersonation_sessions')
        .select(
          `
          id,
          is_active,
          reason,
          started_at,
          ended_at,
          superadminid,
          target_userid,
          organization_id,
          users!impersonation_sessions_superadminid_fkey (name),
          users!impersonation_sessions_target_userid_fkey (name, email),
          organizations!impersonation_sessions_organization_id_fkey (name)
        `,
        )
        .eq('superadminid', superadminId)
        .order('started_at', { ascending: false })
        .limit(parseInt(limit));

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const formattedSessions = (sessions || []).map((s: any) => {
        const superadmin = s.users?.[0] || s.users;
        const targetUser = s.users?.[1] || (s.users && s.users.length > 1 ? s.users[1] : null);
        const org = s.organizations;

        return {
          id: s.id,
          isActive: s.is_active,
          superadminName: superadmin?.name,
          targetUserName: targetUser?.name,
          targetUserEmail: targetUser?.email,
          organizationName: org?.name,
          reason: s.reason,
          startedAt: s.started_at,
          endedAt: s.ended_at,
          duration: s.ended_at ? s.ended_at - s.started_at : 0,
        };
      });

      return NextResponse.json({ sessions: formattedSessions });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('[Impersonation API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { superadminId, targetUserId, reason } = await request.json();

    if (!superadminId || !targetUserId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const { data: targetUser } = await supabase
      .from('users')
      .select('organizationId')
      .eq('id', targetUserId)
      .single();

    if (!targetUser?.organizationId) {
      return NextResponse.json(
        { error: 'Target user has no organization' },
        { status: 400 },
      );
    }

    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 60 * 60 * 1000;

    const { data: session, error } = await supabase
      .from('impersonation_sessions' as any)
      .insert({
        superadminid: superadminId,
        target_userid: targetUserId,
        organization_id: targetUser.organizationId,
        reason,
        token,
        expires_at: expiresAt,
        started_at: Date.now(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('[Start Impersonation API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { sessionId, userId } = await request.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const { error } = await (supabase as any)
      .from('impersonation_sessions')
      .update({ is_active: false, ended_at: Date.now() })
      .eq('id', sessionId)
      .eq('superadminid', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[End Impersonation API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
