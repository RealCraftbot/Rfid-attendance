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

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            students: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrgs = organizations.map(org => ({
      id: org.id,
      name: org.name,
      email: org.email,
      status: org.status,
      createdAt: org.createdAt.toISOString(),
      users: org._count.users,
      students: org._count.students
    }));

    return success(formattedOrgs);
  } catch (error) {
    console.error('[Super Admin Organizations API Error]', error);
    return serverError('Failed to fetch organizations');
  }
}
