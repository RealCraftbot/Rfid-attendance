import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const linkStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID required'),
  parentId: z.string().min(1, 'Parent ID required'),
  relationship: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']).default('GUARDIAN'),
  isPrimary: z.boolean().default(false),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    
    const linkedStudentIds = await prisma.studentParent.findMany({
      where: {
        parent: { orgId }
      },
      select: { studentId: true }
    });
    
    const linkedIds = linkedStudentIds.map(sp => sp.studentId);
    
    const unlinkedStudents = await prisma.student.findMany({
      where: {
        orgId,
        id: { notIn: linkedIds }
      },
      select: {
        id: true,
        name: true,
        rfidUid: true,
        grade: true,
        classroom: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return success(unlinkedStudents);
  } catch (error) {
    console.error('[Unlinked Students API Error]', error);
    return serverError('Failed to fetch unlinked students');
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
    
    const parsed = linkStudentSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { studentId, parentId, relationship, isPrimary } = parsed.data;

    const parent = await prisma.parent.findFirst({
      where: { id: parentId, orgId }
    });

    if (!parent) {
      return NextResponse.json(
        { success: false, error: 'Parent not found' },
        { status: 404 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, orgId }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if link already exists
    const existingLink = await prisma.studentParent.findUnique({
      where: {
        studentId_parentId: { studentId, parentId }
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { success: false, error: 'Student already linked to this parent' },
        { status: 400 }
      );
    }

    // Create the link
    const studentParent = await prisma.studentParent.create({
      data: {
        studentId,
        parentId,
        relationship,
        isPrimary,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rfidUid: true,
            grade: true,
            classroom: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        parent: {
          select: {
            id: true,
            name: true,
            relationship: true
          }
        }
      }
    });

    return success(studentParent, 201);
  } catch (error) {
    console.error('[Link Student API Error]', error);
    return serverError('Failed to link student');
  }
}

// DELETE - Unlink a student from a parent
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const { searchParams } = new URL(request.url);
    const studentParentId = searchParams.get('id');

    if (!studentParentId) {
      return validationError({
        issues: [{ path: ['id'], message: 'Student-Parent link ID required' }],
        name: 'ZodError',
      } as any);
    }

    // Verify the link belongs to this org
    const link = await prisma.studentParent.findFirst({
      where: {
        id: studentParentId,
        parent: { orgId }
      }
    });

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    await prisma.studentParent.delete({
      where: { id: studentParentId }
    });

    return success({ deleted: true });
  } catch (error) {
    console.error('[Unlink Student API Error]', error);
    return serverError('Failed to unlink student');
  }
}
