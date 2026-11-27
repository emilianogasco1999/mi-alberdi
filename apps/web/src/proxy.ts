import { NextResponse, type NextRequest } from 'next/server';
import type { RolUsuario } from '@mi-alberdi/shared';
import { getHomeRouteForRole } from '@/features/auth/domain/services/post-login-route';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:4000';
const SESSION_TIMEOUT_MS = 3000;

interface SessionResponse {
  user?: { role?: string | null } | null;
}

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(({ name }) => name.includes('session_token'));
}

async function fetchRole(request: NextRequest): Promise<RolUsuario | null> {
  try {
    const response = await fetch(`${API_ORIGIN}/api/auth/get-session`, {
      headers: { cookie: request.headers.get('cookie') ?? '' },
      cache: 'no-store',
      signal: AbortSignal.timeout(SESSION_TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const session = (await response.json()) as SessionResponse | null;
    return session?.user ? ((session.user.role ?? 'vecino') as RolUsuario) : null;
  } catch {
    // API unreachable or slow: fail closed.
    return null;
  }
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnUrl', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

function canAccess(pathname: string, rol: RolUsuario): boolean {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return rol === 'admin';
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return rol === 'comerciante' || rol === 'admin';
  }
  return true;
}

/**
 * Edge guard for private areas. It is a UX/first-line check: the API still enforces
 * authorization on every private endpoint (requireAuth / requireRole).
 */
export async function proxy(request: NextRequest) {
  if (!hasSessionCookie(request)) {
    return redirectToLogin(request);
  }

  const rol = await fetchRole(request);
  if (!rol) {
    return redirectToLogin(request);
  }

  if (!canAccess(request.nextUrl.pathname, rol)) {
    return NextResponse.redirect(new URL(getHomeRouteForRole(rol), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
