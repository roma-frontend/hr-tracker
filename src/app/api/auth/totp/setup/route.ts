import { NextResponse } from 'next/server';
import { generateTotpSecret } from '@/lib/supabase/totp';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await generateTotpSecret(user.id);

    return NextResponse.json({
      secret: result.secret,
      backupCodes: result.backupCodes,
      qrCodeUrl: result.qrCodeUrl,
    });
  } catch (error) {
    console.error('[totp/setup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate TOTP secret' },
      { status: 500 }
    );
  }
}
