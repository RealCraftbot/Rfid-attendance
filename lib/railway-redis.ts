import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

export async function getRailwayRedis(): Promise<RedisClientType | null> {
  // Skip if no Redis URL configured
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
    // Fallback: allow request if Redis unavailable
    return { allowed: true, remaining: limit, reset: Date.now() + windowSeconds * 1000 };
  }

  const now = Math.floor(Date.now() / 1000);
  const windowKey = Math.floor(now / windowSeconds);
  const fullKey = `ratelimit:${key}:${windowKey}`;

  try {
    // Get current count
    const current = await redis.get(fullKey);
    const count = current ? parseInt(current) : 0;

    if (count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        reset: (windowKey + 1) * windowSeconds * 1000,
      };
    }

    // Increment count
    await redis.incr(fullKey);
    
    // Set expiry on first request
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
    // Fail open
    return { allowed: true, remaining: limit, reset: Date.now() + windowSeconds * 1000 };
  }
}
