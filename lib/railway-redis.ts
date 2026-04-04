import { createClient, RedisClientType } from 'redis';
import { NextResponse } from 'next/server';

// Re-export rate limit response helper
export function tooManyRequests(message = 'Rate limit exceeded', retryAfter?: number): NextResponse {
  const headers = retryAfter ? { 'Retry-After': String(retryAfter) } : undefined;
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message,
      },
    },
    { status: 429, headers }
  );
}

let client: RedisClientType | null = null;

export async function getRailwayRedis(): Promise<RedisClientType | null> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  if (!client) {
    try {
      client = createClient({
        url: redisUrl,
      });

      client.on('error', (err) => {
        console.error('[Railway Redis] Error:', err);
      });

      client.on('connect', () => {
        console.log('[Railway Redis] Connected successfully');
      });

      await client.connect();
    } catch (error) {
      console.error('[Railway Redis] Failed to connect:', error);
      return null;
    }
  }

  return client;
}

// Simple rate limiting using Railway Redis
export async function checkRateLimitRailway(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const redis = await getRailwayRedis();
  
  if (!redis) {
    return { allowed: true, remaining: limit, reset: Date.now() + windowSeconds * 1000 };
  }

  const now = Math.floor(Date.now() / 1000);
  const windowKey = Math.floor(now / windowSeconds);
  const fullKey = `ratelimit:${key}:${windowKey}`;

  try {
    const current = await redis.get(fullKey);
    const count = current ? parseInt(current) : 0;

    if (count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        reset: (windowKey + 1) * windowSeconds * 1000,
      };
    }

    await redis.incr(fullKey);
    
    if (count === 0) {
      await redis.expire(fullKey, windowSeconds);
    }

    return {
      allowed: true,
      remaining: limit - count - 1,
      reset: (windowKey + 1) * windowSeconds * 1000,
    };
  } catch (error) {
    console.error('[Rate Limit] Redis error:', error);
    return { allowed: true, remaining: limit, reset: Date.now() + windowSeconds * 1000 };
  }
}

// Rate limit configurations for different endpoints
export const rateLimitConfigs = {
  login: { limit: 10, window: 900 },      // 10 per 15 minutes
  signup: { limit: 3, window: 3600 },     // 3 per hour
  passwordReset: { limit: 3, window: 3600 }, // 3 per hour
  scan: { limit: 1000, window: 60 },      // 1000 per minute
  api: { limit: 100, window: 60 },        // 100 per minute
  upload: { limit: 10, window: 60 },      // 10 per minute
};

// Helper to apply rate limiting in API routes
export async function applyRateLimit(
  request: Request,
  type: keyof typeof rateLimitConfigs,
  identifier?: string
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const config = rateLimitConfigs[type];
  const ip = identifier || getClientIp(request);
  const key = `${type}:${ip}`;
  
  return await checkRateLimitRailway(key, config.limit, config.window);
}

// Helper to get client IP
function getClientIp(request: Request): string {
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
