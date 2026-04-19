import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    
    if (!token) {
      return NextResponse.json({ valid: false });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, reset_password_token, reset_password_expiry')
      .eq('reset_password_token', token)
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false });
    }

    const isValid = data.reset_password_expiry ? Date.now() <= data.reset_password_expiry : false;

    return NextResponse.json({ valid: isValid });
  } catch (err) {
    return NextResponse.json({ valid: false });
  }
}
