import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/pilot', '/admin']

// Routes that require specific roles
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['admin'],
  '/pilot': ['pilot', 'admin'],
}

// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ['/login', '/register']

interface JWTPayload {
  userId: string
  email: string
  role: 'client' | 'pilot' | 'admin'
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Skip auth check for public assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname === '/' ||
    pathname.startsWith('/book')
  ) {
    return res
  }

  // Get token from cookie or Authorization header
  const token = req.cookies.get('auth-token')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '')

  // Verify token if present
  const user = token ? await verifyToken(token) : null

  // Handle auth routes (login/register) - redirect to dashboard if already logged in
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return res
  }

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // No valid token - redirect to login
    if (!user) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check role-based access
    for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(user.role)) {
          // User doesn't have required role - redirect to dashboard with error
          const dashboardUrl = new URL('/dashboard', req.url)
          dashboardUrl.searchParams.set('error', 'unauthorized')
          return NextResponse.redirect(dashboardUrl)
        }
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}