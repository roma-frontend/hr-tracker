import { NextRequest, NextResponse } from 'next/server';
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

async function getUserId(body: any): Promise<string | null> {
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
    const { password } = body;

    const userId = await getUserId(body);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Re-authenticate: verify password
    const totpData = await convexQuery('auth:getUserForTotpVerification', { userId });
    if (!totpData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (totpData.passwordHash !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Disable 2FA
    await convexMutation('auth:disableTotp', { userId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('TOTP disable error:', error);
    return NextResponse.json({ error: error.message || 'Failed to disable 2FA' }, { status: 500 });
  }
}
