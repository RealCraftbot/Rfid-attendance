import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/classrooms - Retrieve all classrooms for an organization
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { orgId } = session?.user || {};
    
    if (!orgId) {
      return forbidden('Organization ID is required');
    }
    
    const classrooms = await prisma.classroom.findMany({
      where: {
        orgId
      },
      select: {
        id: true,
        name: true,
        grade: true
      }
    });
    
    return success(classrooms);
  } catch (error) {
    console.error('[Classrooms API Error]', error);
    return serverError('Failed to retrieve classrooms');
  }
}