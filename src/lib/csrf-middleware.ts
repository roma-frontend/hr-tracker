import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfFromRequest, requiresCsrfProtection } from '@/lib/csrf';

/**
 * CSRF protection middleware for API routes
 * Usage: Apply to all POST/PUT/DELETE/PATCH requests
 */
export function withCsrfProtection(
  handler: (req: NextRequest) => Promise<Response | NextResponse | undefined>,
) {
  return async (req: NextRequest): Promise<Response | NextResponse> => {
    const result = await handler(req);
    if (result === undefined) {
      // Возвращаем 500, если handler не вернул ответ
      return NextResponse.json(
        { error: 'Internal Server Error: No response returned from handler.' },
        { status: 500 },
      );
    }
    // Skip GET requests - they don't modify state
    if (req.method === 'GET') {
      const getResult = await handler(req);
      if (getResult === undefined) {
        return NextResponse.json(
          { error: 'Internal Server Error: No response returned from handler.' },
          { status: 500 },
        );
      }
      return getResult;
    }
    return result;
  };
}



      return new NextResponse(JSON.stringify({ error: 'CSRF validation failed: Invalid token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // CSRF validation passed, proceed to handler
    return handler(req);
  };
}
