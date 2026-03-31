export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;

    const busRoutes = await prisma.busRoute.findMany({
      where: { orgId },
      include: {
        stops: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { students: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    const routes = busRoutes.map(route => ({
      id: route.id,
      name: route.name,
      routeCode: route.routeCode,
      morningStart: route.morningStart,
      eveningEnd: route.eveningEnd,
      isActive: route.isActive,
      studentCount: route._count.students,
      stops: route.stops
    }));

    return success(routes);
  } catch (error) {
    console.error('[Bus Routes API Error]', error);
    return serverError('Failed to fetch bus routes');
  }
}
