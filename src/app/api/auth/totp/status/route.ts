import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

// Opt out of static generation — uses cookies
export const revalidate = 0;

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

async function getUserIdFromCookie(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('hr-auth-token')?.value;
  if (token) {
    const payload = await verifyJWT(token);
    if (payload) return payload.userId;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    let userId = await getUserIdFromCookie(req);
    if (!userId) {
      userId = req.nextUrl.searchParams.get('userId');
    }
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const status = await convexQuery('auth:getTotpStatus', { userId });

    return NextResponse.json({
      totpEnabled: status?.totpEnabled ?? false,
    });
  } catch (error: any) {
    console.error('TOTP status error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
