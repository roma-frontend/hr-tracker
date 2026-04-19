import { NextResponse } from 'next/server';
import { verifyTotpCode } from '@/lib/supabase/totp';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const isValid = await verifyTotpCode(user.id, code);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[totp/verify-setup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify TOTP setup' },
      { status: 500 }
    );
  }
}
