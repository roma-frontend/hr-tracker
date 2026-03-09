import { NextRequest, NextResponse } from 'next/server';
import { verifySync } from 'otplib';
import { verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

async function convexQuery(path: string, args: Record<string, unknown>) {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args }),
  });
  const data = await res.json();
  if (data.status === 'error') return null;
  return data.value;
}

async function convexMutation(path: string, args: Record<string, unknown>) {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args }),
  });
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.errorMessage ?? 'Convex error');
  return data.value;
}

async function getUserId(req: NextRequest, body: any): Promise<string | null> {
  // Try JWT cookie first
  const cookieStore = await cookies();
  const token = cookieStore.get('hr-auth-token')?.value;
  if (token) {
    const payload = await verifyJWT(token);
    if (payload) return payload.userId;
  }
  // Fallback to userId from body
  return body.userId || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    const userId = await getUserId(req, body);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
    }

    // Get the stored secret
    const totpData = await convexQuery('auth:getUserForTotpVerification', { userId });

    if (!totpData?.totpSecret) {
      return NextResponse.json({ error: 'TOTP not set up' }, { status: 400 });
    }

    // Verify the code
    const result = verifySync({ token: code, secret: totpData.totpSecret });

    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Enable 2FA
    await convexMutation('auth:enableTotp', { userId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('TOTP verify-setup error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
