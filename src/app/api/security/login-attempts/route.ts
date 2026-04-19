import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'get-login-attempts-by-user': {
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!userId) {
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { data: attempts, error } = await supabase
          .from('login_attempts')
          .select('*')
          .eq('userid', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: attempts || [] });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Security Login Attempts API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
