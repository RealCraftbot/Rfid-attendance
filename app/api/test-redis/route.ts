import { NextResponse } from 'next/server';
import { getRailwayRedis } from '@/lib/railway-redis';

export async function GET() {
  try {
    const redis = await getRailwayRedis();
    
    if (!redis) {
      return NextResponse.json({
        status: 'error',
        message: 'Redis not connected',
        redisUrl: process.env.REDIS_URL ? 'Set (hidden)' : 'Not set',
      }, { status: 500 });
    }

    // Test Redis connection
    await redis.set('test:connection', 'OK', { EX: 60 });
    const value = await redis.get('test:connection');
    
    // Get Redis info
    const info = await redis.info('server');
    
    return NextResponse.json({
      status: 'connected',
      testValue: value,
      redisVersion: info.match(/redis_version:(.+)/)?.[1] || 'unknown',
      message: 'Redis is working!',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
