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

    const devices = await prisma.device.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });

    return success(devices);
  } catch (error) {
    console.error('[Devices API Error]', error);
    return serverError('Failed to fetch devices');
  }
}
