import { NextResponse } from 'next/server';
import { getTotpStatus } from '@/lib/supabase/totp';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getTotpStatus(user.id);

    return NextResponse.json(status);
  } catch (error) {
    console.error('[totp/status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get TOTP status' },
      { status: 500 }
    );
  }
}
