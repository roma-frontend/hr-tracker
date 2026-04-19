import { NextResponse } from 'next/server';
import { verifyTotpCode, verifyBackupCode, enableTotp } from '@/lib/supabase/totp';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, useBackupCode } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    let isValid = false;

    if (useBackupCode) {
      isValid = await verifyBackupCode(user.id, code);
    } else {
      isValid = await verifyTotpCode(user.id, code);
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
    }

    await enableTotp(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[totp/verify] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify TOTP code' },
      { status: 500 }
    );
  }
}
