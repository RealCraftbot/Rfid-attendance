import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/teachers - Retrieve all teachers for an organization
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { orgId } = session?.user || {};
    
    if (!orgId) {
      return forbidden('Organization ID is required');
    }
    
    const teachers = await prisma.user.findMany({
      where: {
        orgId,
        role: 'TEACHER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true
      }
    });
    
    return success(teachers);
  } catch (error) {
    console.error('[Teachers API Error]', error);
    return serverError('Failed to retrieve teachers');
  }
}