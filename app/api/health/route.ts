export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { MonitoringService } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Public health check (basic)
export async function GET() {
  try {
    const health = await MonitoringService.checkHealth();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

// Detailed metrics (authenticated admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { type } = await request.json();
    
    switch (type) {
      case 'security':
        const securityMetrics = await MonitoringService.getSecurityMetrics();
        return NextResponse.json(securityMetrics);
        
      case 'business':
        const businessMetrics = await MonitoringService.getBusinessMetrics();
        return NextResponse.json(businessMetrics);
        
      case 'full':
        const [health, security, business] = await Promise.all([
          MonitoringService.checkHealth(),
          MonitoringService.getSecurityMetrics(),
          MonitoringService.getBusinessMetrics(),
        ]);
        
        return NextResponse.json({
          health,
          security,
          business,
          timestamp: new Date().toISOString(),
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid metrics type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
