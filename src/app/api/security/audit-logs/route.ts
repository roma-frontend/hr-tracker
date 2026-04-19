import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select(
        `
        id,
        userid,
        action,
        details,
        ip,
        created_at,
        users!audit_logs_userid_fkey (name, email)
      `,
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      logs: (logs || []).map((log) => {
        const user = log.users;
        return {
          id: log.id,
          userId: log.userid,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || '',
          action: log.action,
          details: log.details,
          ip: log.ip,
          createdAt: log.created_at,
        };
      }),
    });
  } catch (error) {
    console.error('[Audit Logs API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
