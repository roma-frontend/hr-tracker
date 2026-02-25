import { type NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/attendance',
  '/employees',
  '/leaves',
  '/analytics',
  '/reports',
  '/tasks',
  '/calendar',
  '/approvals',
  '/settings',
]

// Auth routes (redirect to dashboard if already logged in)
const AUTH_ROUTES = ['/login', '/register']

// Public routes (always accessible)
const PUBLIC_ROUTES = ['/', '/privacy', '/terms', '/about', '/login', '/register']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('hr-auth-token')?.value

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // ── Redirect authenticated users away from auth pages ──────────────────
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))

  }

  // ── Block unauthenticated users from protected routes ──────────────────
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    // Remember where they were trying to go
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|icon.svg|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)',
  ],
}
