import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/app/api/auth/[...nextauth]/route';

/**
 * Logout API Route - Complete session termination
 */
export async function POST(req: NextRequest) {
  try {
    const redirectUrl = req.nextUrl.searchParams.get('redirect') || '/login';

    // Sign out and redirect
    return await signOut({ redirect: false });
  } catch (error) {
    console.error('[Logout API] Error during logout:', error);
    return NextResponse.redirect(new URL('/login', req.url), { status: 302 });
  }
}
