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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all', 'unread', 'read'

    let whereClause: any = { orgId };

    if (type === 'unread') {
      whereClause.isRead = false;
    } else if (type === 'read') {
      whereClause.isRead = true;
    }

    // For now, we'll return empty since there's no Notification model
    // This can be extended when notifications are implemented
    return success([]);
  } catch (error) {
    console.error('[Notifications API Error]', error);
    return serverError('Failed to fetch notifications');
  }
}
