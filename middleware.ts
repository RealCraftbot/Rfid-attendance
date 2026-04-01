import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define role-based route access
const routePermissions: Record<string, string[]> = {
  // Base dashboard - all authenticated users
  '/dashboard': ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'BURSAR', 'PARENT'],
  
  // Admin routes
  '/dashboard/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard/staff': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard/devices': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard/bus': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard/timetable': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard/teacher-schedule': ['ADMIN', 'SUPER_ADMIN', 'TEACHER'],
  '/dashboard/teacher-attendance': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard/admin/fees': ['ADMIN', 'SUPER_ADMIN'],
  
  // Teacher routes
  '/dashboard/classrooms': ['ADMIN', 'SUPER_ADMIN', 'TEACHER'],
  '/dashboard/attendance': ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'PARENT'],
  
  // Bursar routes
  '/dashboard/bursar': ['ADMIN', 'SUPER_ADMIN', 'BURSAR'],
  
  // Parent routes
  '/dashboard/parent': ['PARENT'],
  '/dashboard/fees': ['PARENT'],
  '/dashboard/view-reports': ['PARENT'],
  '/dashboard/notifications': ['PARENT'],
  
  // Shared routes
  '/dashboard/students': ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'BURSAR'],
  '/dashboard/parents': ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'BURSAR', 'PARENT'],
  '/dashboard/grades': ['ADMIN', 'SUPER_ADMIN', 'TEACHER'],
  '/dashboard/settings': ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'BURSAR', 'PARENT'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/parent-signup') ||
    pathname.startsWith('/invite') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/forgot-password') ||
    pathname.startsWith('/api/reset-password') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/debug') ||
    pathname === '/' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/super-admin')
  ) {
    return NextResponse.next();
  }

  // Check for session token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role as string;
  const passwordSet = token.passwordSet as boolean | null;

  // Check if password has been set (skip for super-admin and certain routes)
  if (passwordSet === false && 
      userRole !== 'SUPER_ADMIN' && 
      !pathname.startsWith('/verify-email') &&
      !pathname.startsWith('/api/otp') &&
      !pathname.startsWith('/invite')) {
    return NextResponse.redirect(new URL('/verify-email', request.url));
  }

  // Check route permissions
  const allowedRoles = Object.entries(routePermissions).find(([route]) => 
    pathname.startsWith(route)
  )?.[1];

  // If route requires specific permissions and user doesn't have access
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log(`Access denied for role ${userRole} to ${pathname}. Allowed: ${allowedRoles.join(', ')}`);
    // Redirect to appropriate dashboard based on role
    let redirectPath = '/dashboard';
    
    switch (userRole) {
      case 'BURSAR':
        redirectPath = '/dashboard/bursar';
        break;
      case 'PARENT':
        redirectPath = '/dashboard/parent';
        break;
      case 'TEACHER':
        redirectPath = '/dashboard';
        break;
      case 'ADMIN':
      case 'SUPER_ADMIN':
        redirectPath = '/dashboard';
        break;
      default:
        redirectPath = '/login';
    }
    
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
    '/verify-email',
  ],
};
