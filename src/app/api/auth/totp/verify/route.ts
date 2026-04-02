import { NextRequest, NextResponse } from 'next/server';
import { verifySync } from 'otplib';
import { signJWT, verifyJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

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

export async function POST(req: NextRequest) {
  try {
    const { tempToken, code, isBackupCode } = await req.json();

    if (!tempToken || !code) {
      return NextResponse.json({ error: 'Token and code are required' }, { status: 400 });
    }

    // Verify temp token
    const payload = await verifyJWT(tempToken);
    if (!payload || payload.type !== '2fa-pending') {
      return NextResponse.json(
        { error: 'Invalid or expired verification session' },
        { status: 401 },
      );
    }

    const userId = payload.userId;

    // Get user TOTP data
    const totpData = await convexQuery('auth:getUserForTotpVerification', { userId });
    if (!totpData || !totpData.totpEnabled) {
      return NextResponse.json({ error: '2FA not enabled for this account' }, { status: 400 });
    }

    let verified = false;

    if (isBackupCode) {
      // Check backup codes
      const backupCodes = totpData.backupCodes ?? [];
      for (let i = 0; i < backupCodes.length; i++) {
        const match = await bcrypt.compare(code.toUpperCase(), backupCodes[i]);
        if (match) {
          verified = true;
          // Remove used backup code
          await convexMutation('auth:removeBackupCode', { userId, codeIndex: i });
          break;
        }
      }
    } else {
      // Verify TOTP code
      const result = verifySync({ token: code, secret: totpData.totpSecret! });
      verified = result.valid;
    }

    if (!verified) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Create full JWT session (copy session data from temp token)
    const jwt = await signJWT({
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      department: payload.department,
      position: payload.position,
      employeeType: payload.employeeType,
      avatar: payload.avatar,
    });

    // Set session cookies
    const cookieStore = await cookies();
    cookieStore.set('hr-auth-token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    // Create session token for Convex
    const sessionToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const sessionExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    cookieStore.set('hr-session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      session: {
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        organizationId: payload.organizationId,
        department: payload.department,
        position: payload.position,
        employeeType: payload.employeeType,
        avatar: payload.avatar,
      },
    });
  } catch (error: any) {
    console.error('TOTP verify error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
