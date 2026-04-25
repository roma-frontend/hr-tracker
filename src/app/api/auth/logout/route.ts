import { NextRequest, NextResponse } from 'next/server';
import { withCsrfProtection } from '@/lib/csrf-middleware';

/**
 * Logout API Route - Complete session termination
 * Note: This route is deprecated. Use NextAuth's built-in signOut instead.
 */
export const POST = withCsrfProtection(async (_req: NextRequest) => {
  try {
    // For server-side logout, we just need to clear cookies
    // The actual signOut is handled client-side via next-auth
    const response = NextResponse.json({ success: true });

    // Clear auth cookies
    response.cookies.delete('hr-auth-token');
    response.cookies.delete('oauth-session');
    response.cookies.delete('hr-session-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
});
