/**
 * Performance Middleware
 * Оптимизирует загрузку страниц и редуцирует JavaScript execution time
 */

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Добавляем performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Early hints для критических ресурсов
  if (request.nextUrl.pathname === '/') {
    response.headers.set('Link', [
      '<https://fonts.googleapis.com>; rel=preconnect',
      '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
      '<https://steady-jaguar-712.convex.cloud>; rel=preconnect',
    ].join(', '));
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
