import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth',
];

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/rideSharing',
  '/tripPlanner',
  '/chats',
  '/notifications',
  '/users',
  '/reviews',
  '/my-reviews',
  '/questions',
];

// Helper function to check if a path is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  });
}

// Helper function to check if a path is protected
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/favicon.ico') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/auth'))
  ) {
    return NextResponse.next();
  }

  // Get the session token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Log middleware activity for debugging
  console.log(`🔐 Middleware: ${pathname} | Token: ${token ? '✅ Present' : '❌ Missing'}`);

  // If accessing a public route
  if (isPublicRoute(pathname)) {
    // If user is authenticated and trying to access login/register, redirect to dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
      console.log('📍 Authenticated user accessing auth page, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to public routes
    return NextResponse.next();
  }

  // If accessing a protected route
  if (isProtectedRoute(pathname) || pathname.startsWith('/(view)')) {
    if (!token) {
      console.log('🚫 Unauthenticated user accessing protected route, redirecting to login');
      // Store the attempted URL for redirect after login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Allow access to protected routes for authenticated users
    return NextResponse.next();
  }

  // Default behavior for other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, except /api/auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};