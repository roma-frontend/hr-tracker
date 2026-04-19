import { NextResponse } from 'next/server';
import { recordFaceIdAttempt } from '@/lib/supabase/face';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, success } = body;

    if (!userId || typeof success !== 'boolean') {
      return NextResponse.json(
        { error: 'userId and success are required' },
        { status: 400 }
      );
    }

    await recordFaceIdAttempt(userId, success);

    const { data: user } = await supabase
      .from('users')
      .select('faceid_failed_attempts, faceid_blocked')
      .eq('id', userId)
      .single();

    return NextResponse.json({
      attempts: user?.faceid_failed_attempts || 0,
      blocked: user?.faceid_blocked || false,
    });
  } catch (error) {
    console.error('[face-recognition/record-attempt] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
