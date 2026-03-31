import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const linkStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID required'),
  guardianEmail: z.string().email('Invalid guardian email'),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    
    const parentEmails = await prisma.user.findMany({
      where: { orgId, role: 'PARENT' },
      select: { email: true }
    });
    
    const parentEmailList = parentEmails.map(p => p.email);
    
    const unlinkedStudents = await prisma.student.findMany({
      where: {
        orgId,
        OR: [
          { guardianEmail: { notIn: parentEmailList } },
          { guardianEmail: null }
        ]
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

    const { studentId, guardianEmail, guardianName, guardianPhone } = parsed.data;

    const parent = await prisma.user.findFirst({
      where: { 
        email: guardianEmail, 
        role: 'PARENT',
        orgId 
      }
    });

    if (!parent) {
      return NextResponse.json(
        { success: false, error: 'Parent not found with this email' },
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

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        guardianEmail,
        guardianName: guardianName || parent.name,
        guardianPhone: guardianPhone || null
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        }
      }
    });

    return success(updatedStudent);
  } catch (error) {
    console.error('[Link Student API Error]', error);
    return serverError('Failed to link student');
  }
}
