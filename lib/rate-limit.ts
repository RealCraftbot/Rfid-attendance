import { Ratelimit } from '@upstash/ratelimit';
import { NextResponse } from 'next/server';

// Redis client - initialized lazily to avoid Edge Runtime issues
let redis: any = null;
let rateLimiters: any = null;

// Initialize Redis client (only on server side)
function getRedis() {
  if (redis) return redis;
  
  try {
    // Dynamic import to avoid Edge Runtime issues
    const { Redis } = require('@upstash/redis');
    
    const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
    
    if (UPSTASH_URL) {
      redis = new Redis({
        url: UPSTASH_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
      });
    } else {
      // Fallback: In-memory for development
      console.warn('[Rate Limit] Using in-memory fallback (not for production)');
      const inMemoryMap = new Map<string, { count: number; resetTime: number }>();
      
      redis = {
        async get(key: string) {
          const data = inMemoryMap.get(key);
          if (!data) return null;
          if (Date.now() > data.resetTime) {
            inMemoryMap.delete(key);
            return null;
          }
          return JSON.stringify(data);
        },
        async set(key: string, value: string, opts?: { ex?: number }) {
          const data = JSON.parse(value);
          inMemoryMap.set(key, {
            count: data.remaining || 0,
            resetTime: Date.now() + (opts?.ex || 60) * 1000,
          });
          return 'OK';
        },
      };
    }
  } catch (error) {
    console.error('[Rate Limit] Failed to initialize Redis:', error);
    // Return null to trigger fallback
    redis = null;
  }
  
  return redis;
}

// Initialize rate limiters
function getRateLimiters() {
  if (rateLimiters) return rateLimiters;
  
  const redisClient = getRedis();
  
  if (!redisClient) {
    // Return null to indicate rate limiting is unavailable
    return null;
  }
  
  rateLimiters = {
    // Authentication endpoints - strict limits
    auth: new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'ratelimit:auth',
    }),
    
    // Login attempts - very strict
    login: new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(10, '15 m'),
      analytics: true,
      prefix: 'ratelimit:login',
    }),
    
    // Password reset - strict
    passwordReset: new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: 'ratelimit:passwordreset',
    }),
    
    // Signup - moderate
    signup: new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: 'ratelimit:signup',
    }),
    
    // RFID scan endpoints - high volume
    scan: new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(1000, '1 m'),
      analytics: true,
      prefix: 'ratelimit:scan',
    }),
    
    // General API
    api: new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:api',
    }),
    
    // File uploads
    upload: new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'ratelimit:upload',
    }),
  };
  
  return rateLimiters;
}

// Helper function to get client IP
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

// Rate limit check helper
export async function checkRateLimit(
  limiter: any,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    if (!limiter) {
      // No rate limiting available - allow request
      return { success: true, limit: 0, remaining: 0, reset: 0 };
    }
    
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

// Create rate limited response
export function createRateLimitResponse(
  remaining: number,
  reset: number
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
      },
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(remaining),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
      },
    }
  );
}

// Middleware-compatible rate limit checker
export async function rateLimitMiddleware(
  request: Request,
  limiterType: string,
  identifier?: string
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const limiters = getRateLimiters();
  
  if (!limiters) {
    // Rate limiting not available - allow request
    return { allowed: true };
  }
  
  const limiter = limiters[limiterType];
  if (!limiter) {
    return { allowed: true };
  }
  
  const ip = identifier || getClientIp(request);
  const result = await checkRateLimit(limiter, ip);
  
  if (!result.success) {
    return {
      allowed: false,
      response: createRateLimitResponse(result.limit, result.reset),
    };
  }
  
  return { allowed: true };
}

// Export rate limit types for middleware
export const rateLimits = {
  auth: 'auth',
  login: 'login',
  passwordReset: 'passwordReset',
  signup: 'signup',
  scan: 'scan',
  api: 'api',
  upload: 'upload',
};
