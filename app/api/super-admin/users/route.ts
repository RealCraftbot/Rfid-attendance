export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'SUPER_ADMIN') {
      return forbidden('Super admin access required');
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
        orgId: true,
        createdAt: true,
        org: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      imageUrl: user.imageUrl,
      orgId: user.orgId,
      org: user.org?.name || 'Platform',
      status: 'active',
      createdAt: user.createdAt.toISOString()
    }));

    return success(formattedUsers);
  } catch (error) {
    console.error('[Super Admin Users API Error]', error);
    return serverError('Failed to fetch users');
  }
}
