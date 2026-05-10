import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes require ADMIN role
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/student', req.url));
    }

    // Student routes require authentication
    if (pathname.startsWith('/student') && !token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const res = NextResponse.next();
    Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/student/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
  ],
};
