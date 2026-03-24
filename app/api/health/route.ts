import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Get database version
    const result = await prisma.$queryRaw<{ version: string }[]>`SELECT version()`;
    
    // Count records in key tables
    const orgCount = await prisma.organization.count();
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: result[0]?.version || 'unknown',
      stats: {
        organizations: orgCount,
        users: userCount,
        students: studentCount,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
