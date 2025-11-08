import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Non-generic admin route to avoid bot targeting
const ADMIN_ROUTE = '/manage';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /manage routes except /manage/login
  if (pathname.startsWith(ADMIN_ROUTE) && pathname !== `${ADMIN_ROUTE}/login`) {
    const sessionCookie = request.cookies.get('wp_admin_session');
    
    if (!sessionCookie) {
      // Redirect to login
      const loginUrl = new URL(`${ADMIN_ROUTE}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify session is valid (not expired)
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.expiresAt < Date.now()) {
        const loginUrl = new URL(`${ADMIN_ROUTE}/login`, request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // Invalid session format, redirect to login
      const loginUrl = new URL(`${ADMIN_ROUTE}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow access to login page
  if (pathname === `${ADMIN_ROUTE}/login`) {
    const sessionCookie = request.cookies.get('wp_admin_session');
    
    // If already logged in, redirect to dashboard
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session.expiresAt >= Date.now()) {
          return NextResponse.redirect(new URL(ADMIN_ROUTE, request.url));
        }
      } catch (error) {
        // Invalid session, allow access to login
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/manage/:path*',
  ],
};

