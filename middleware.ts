import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define role-based route access
const routePermissions: Record<string, string[]> = {
  // Admin routes
  '/dashboard/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard/staff': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard/devices': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard/bus': ['ADMIN', 'SUPER_ADMIN'],
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
  '/dashboard/parents': ['ADMIN', 'SUPER_ADMIN', 'TEACHER'],
  '/dashboard/grades': ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'PARENT'],
  '/dashboard/settings': ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'BURSAR', 'PARENT'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
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

  // Check route permissions
  const allowedRoles = Object.entries(routePermissions).find(([route]) => 
    pathname.startsWith(route)
  )?.[1];

  // If route has specific permissions and user doesn't have access
  if (allowedRoles && !allowedRoles.includes(userRole)) {
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
  ],
};
