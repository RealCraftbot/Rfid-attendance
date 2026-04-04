import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createClient, RedisClientType } from 'redis';
import { NextResponse } from 'next/server';

// Determine which Redis to use
const REDIS_URL = process.env.REDIS_URL || '';
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || '';

// Initialize Redis client based on environment
let redis: Redis | RedisClientType;
let isRailwayRedis = false;

if (REDIS_URL && REDIS_URL.startsWith('redis://')) {
  // Using Railway Redis (native TCP)
  isRailwayRedis = true;
  redis = createClient({
    url: REDIS_URL,
  });
  
  // Connect to Redis (handle connection errors gracefully)
  (redis as RedisClientType).connect().catch((err) => {
    console.error('[Rate Limit] Railway Redis connection failed:', err);
  });
} else if (UPSTASH_URL) {
  // Using Upstash Redis (REST API)
  redis = new Redis({
    url: UPSTASH_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  });
} else {
  // Fallback: Create mock Redis for development
  console.warn('[Rate Limit] No Redis configured. Using in-memory fallback (NOT for production)');
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
  } as any;
}

// Rate limit configurations for different endpoints
export const rateLimits = {
  // Authentication endpoints - strict limits
  auth: new Ratelimit({
    redis: redis as Redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
    analytics: true,
    prefix: 'ratelimit:auth',
  }),
  
  // Login attempts - very strict
  login: new Ratelimit({
    redis: redis as Redis,
    limiter: Ratelimit.slidingWindow(10, '15 m'), // 10 attempts per 15 minutes
    analytics: true,
    prefix: 'ratelimit:login',
  }),
  
  // Password reset - strict
  passwordReset: new Ratelimit({
    redis: redis as Redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 attempts per hour
    analytics: true,
    prefix: 'ratelimit:passwordreset',
  }),
  
  // Signup - moderate
  signup: new Ratelimit({
    redis: redis as Redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 signups per hour per IP
    analytics: true,
    prefix: 'ratelimit:signup',
  }),
  
  // RFID scan endpoints - high volume but still limited
  scan: new Ratelimit({
    redis: redis as Redis,
    limiter: Ratelimit.slidingWindow(1000, '1 m'), // 1000 scans per minute per device
    analytics: true,
    prefix: 'ratelimit:scan',
  }),
  
  // General API - generous but protected
  api: new Ratelimit({
    redis: redis as Redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
    prefix: 'ratelimit:api',
  }),
  
  // File uploads - limited
  upload: new Ratelimit({
    redis: redis as Redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 uploads per minute
    analytics: true,
    prefix: 'ratelimit:upload',
  }),
};

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
  
  // Fallback to a default if we can't determine IP
  return 'unknown';
}

// Rate limit check helper
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if rate limiter is down
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
  limiter: Ratelimit,
  identifier?: string
): Promise<{ allowed: boolean; response?: NextResponse }> {
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
