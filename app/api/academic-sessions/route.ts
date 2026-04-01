import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError, notFound } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const academicSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required'),
  term: z.enum(['FIRST', 'SECOND', 'THIRD']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  schoolOpenTime: z.string().default('07:30'),
  schoolCloseTime: z.string().default('15:00'),
  isActive: z.boolean().default(false),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    
    const sessions = await prisma.academicSession.findMany({
      where: { orgId },
      orderBy: [
        { name: 'desc' },
        { term: 'asc' }
      ]
    });

    return success(sessions);
  } catch (error) {
    console.error('[Academic Sessions API Error]', error);
    return serverError('Failed to fetch academic sessions');
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const body = await request.json();
    
    const parsed = academicSessionSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // If setting as active, deactivate all other sessions
    if (parsed.data.isActive) {
      await prisma.academicSession.updateMany({
        where: { orgId },
        data: { isActive: false }
      });
    }

    // Check if session already exists
    const existing = await prisma.academicSession.findFirst({
      where: {
        orgId,
        name: parsed.data.name,
        term: parsed.data.term
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This academic session already exists' },
        { status: 400 }
      );
    }

    const academicSession = await prisma.academicSession.create({
      data: {
        orgId,
        name: parsed.data.name,
        term: parsed.data.term,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        schoolOpenTime: parsed.data.schoolOpenTime,
        schoolCloseTime: parsed.data.schoolCloseTime,
        isActive: parsed.data.isActive,
      }
    });

    return success(academicSession, 201);
  } catch (error) {
    console.error('[Academic Sessions API Error]', error);
    return serverError('Failed to create academic session');
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return validationError({
        issues: [{ path: ['id'], message: 'Session ID required' }],
        name: 'ZodError',
      } as any);
    }

    const parsed = academicSessionSchema.partial().safeParse(data);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const existing = await prisma.academicSession.findFirst({
      where: { id, orgId }
    });

    if (!existing) {
      return notFound('Academic Session');
    }

    // If setting as active, deactivate all other sessions
    if (parsed.data.isActive === true) {
      await prisma.academicSession.updateMany({
        where: { orgId, id: { not: id } },
        data: { isActive: false }
      });
    }

    const updateData: any = {};
    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.term) updateData.term = parsed.data.term;
    if (parsed.data.startDate) updateData.startDate = new Date(parsed.data.startDate);
    if (parsed.data.endDate) updateData.endDate = new Date(parsed.data.endDate);
    if (parsed.data.schoolOpenTime) updateData.schoolOpenTime = parsed.data.schoolOpenTime;
    if (parsed.data.schoolCloseTime) updateData.schoolCloseTime = parsed.data.schoolCloseTime;
    if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

    const academicSession = await prisma.academicSession.update({
      where: { id },
      data: updateData
    });

    return success(academicSession);
  } catch (error) {
    console.error('[Academic Sessions API Error]', error);
    return serverError('Failed to update academic session');
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return validationError({
        issues: [{ path: ['id'], message: 'Session ID required' }],
        name: 'ZodError',
      } as any);
    }

    const existing = await prisma.academicSession.findFirst({
      where: { id, orgId }
    });

    if (!existing) {
      return notFound('Academic Session');
    }

    await prisma.academicSession.delete({
      where: { id }
    });

    return success({ deleted: true });
  } catch (error) {
    console.error('[Academic Sessions API Error]', error);
    return serverError('Failed to delete academic session');
  }
}
