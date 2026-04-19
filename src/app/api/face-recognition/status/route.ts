import { NextResponse } from 'next/server';
import { checkFaceIdStatus } from '@/lib/supabase/face';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const status = await checkFaceIdStatus(user.id);
    return NextResponse.json(status);
  } catch (error) {
    console.error('[face-recognition/status] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
