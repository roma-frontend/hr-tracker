import { NextRequest, NextResponse } from 'next/server';
import { signOut } from 'next-auth/react';

/**
 * Logout API Route - Complete session termination
 */
export async function POST(req: NextRequest) {
  try {
    await signOut({ redirect: false });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
