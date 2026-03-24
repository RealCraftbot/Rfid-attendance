export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    },
    database: null as any,
    users: null as any,
  };

  try {
    // Test database connection
    await prisma.$connect();
    debug.database = { status: 'connected' };

    // Count users
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      take: 5,
    });

    debug.users = {
      count: userCount,
      list: users,
    };

  } catch (error) {
    debug.database = { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  } finally {
    await prisma.$disconnect();
  }

  return NextResponse.json(debug);
}
