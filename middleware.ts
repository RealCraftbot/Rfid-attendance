import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimitMiddleware, rateLimits, getClientIp } from '@/lib/rate-limit';

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

// CORS configuration
const allowedOrigins = [
  process.env.NEXTAUTH_URL,
  process.env.APP_URL,
].filter(Boolean) as string[];

// Rate limited API routes configuration
const rateLimitConfig: Record<string, { limiterType: string; identifier?: (req: NextRequest) => string }> = {
  '/api/auth': { limiterType: rateLimits.login },
  '/api/login': { limiterType: rateLimits.login },
  '/api/signup': { limiterType: rateLimits.signup },
  '/api/forgot-password': { limiterType: rateLimits.passwordReset },
  '/api/reset-password': { limiterType: rateLimits.passwordReset },
  '/api/scanAttendance': { 
    limiterType: rateLimits.scan,
    identifier: (req) => req.headers.get('x-device-id') || getClientIp(req)
  },
  '/api/upload': { limiterType: rateLimits.upload },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin') || '';
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleCORS(request, origin);
  }
  
  // Add CORS headers to all responses
  const corsHeaders = getCORSHeaders(origin);
  
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
    pathname === '/' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/super-admin')
  ) {
    // Apply rate limiting to public API routes
    if (pathname.startsWith('/api/')) {
      const rateLimitResult = await applyRateLimit(request, pathname);
      if (!rateLimitResult.allowed) {
        return rateLimitResult.response;
      }
    }
    
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = await applyRateLimit(request, pathname);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }
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

  // Check if email is verified (skip for certain routes if needed)
  if (!token.emailVerified && !pathname.startsWith('/verify-email')) {
    // Redirect to email verification page
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

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// CORS handler for preflight requests
function handleCORS(request: NextRequest, origin: string): NextResponse {
  const headers = getCORSHeaders(origin);
  
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...headers,
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Get CORS headers based on origin
function getCORSHeaders(origin: string): Record<string, string> {
  const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.length === 0;
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Device-Token, X-Device-Id',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Apply rate limiting based on route
async function applyRateLimit(request: NextRequest, pathname: string): Promise<{ allowed: boolean; response?: NextResponse }> {
  // Find matching rate limit config
  const configEntry = Object.entries(rateLimitConfig).find(([route]) => 
    pathname.startsWith(route)
  );
  
  if (!configEntry) {
    return { allowed: true };
  }
  
  const [, config] = configEntry;
  const identifier = config.identifier 
    ? config.identifier(request) 
    : getClientIp(request);
  
  return await rateLimitMiddleware(request, config.limiterType, identifier);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/verify-email',
  ],
};
