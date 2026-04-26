import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfFromRequest, requiresCsrfProtection } from '@/lib/csrf';

/**
 * CSRF protection middleware for API routes
 * Usage: Apply to all POST/PUT/DELETE/PATCH requests
 */
export function withCsrfProtection(
  handler: (req: NextRequest) => Promise<Response | NextResponse>,
) {
  return async (req: NextRequest): Promise<Response | NextResponse> => {
    // Skip GET requests - they don't modify state
    if (req.method === 'GET') {
      return handler(req);
    }

    // Check if method requires CSRF protection
    if (!requiresCsrfProtection(req.method)) {
      return handler(req);
    }

    // Allow internal requests (from same origin)
    const referer = req.headers.get('referer');
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');

    // Skip CSRF for requests from same origin/browser
    const isSameOrigin =
      (referer && host && referer.includes(host)) || (origin && host && origin.includes(host));
    if (isSameOrigin) {
      return handler(req);
    }

    // For external requests, verify CSRF token
    const isValid = verifyCsrfFromRequest(req);
    if (!isValid) {
      return new NextResponse(JSON.stringify({ error: 'CSRF validation failed: Invalid token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // CSRF validation passed, proceed to handler
    return handler(req);
  };
}
