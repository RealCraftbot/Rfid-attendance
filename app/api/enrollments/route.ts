import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const approvalSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID required'),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return forbidden('Admin access required');
    }

    const orgId = session.user.orgId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const enrollments = await prisma.enrollment.findMany({
      where: {
        orgId,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return success(enrollments);
  } catch (error) {
    console.error('[Enrollments API Error]', error);
    return serverError('Failed to fetch enrollments');
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId || !session?.user?.id) {
      return forbidden('Authentication required');
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return forbidden('Admin access required');
    }

    const body = await request.json();
    const parsed = approvalSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { enrollmentId, action, rejectionReason } = parsed.data;
    const orgId = session.user.orgId;

    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, orgId },
    });

    if (!enrollment) {
      return validationError({
        issues: [{ path: ['enrollmentId'], message: 'Enrollment not found' }],
        name: 'ZodError',
      } as any);
    }

    if (action === 'reject') {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: 'REJECTED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || null,
        },
      });

      return success({ message: 'Enrollment rejected' });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: enrollment.parentEmail,
          password: hashedPassword,
          name: enrollment.parentName,
          role: 'PARENT',
          orgId,
        },
      });

      await tx.student.create({
        data: {
          name: enrollment.studentName,
          rfidUid: `ENR-${Date.now()}-${Math.random().toString(6).slice(-4)}`,
          orgId,
          dateOfBirth: enrollment.studentDob,
          guardianName: enrollment.parentName,
          guardianPhone: enrollment.parentPhone,
          guardianEmail: enrollment.parentEmail,
          grade: enrollment.gradeApplying,
        },
      });

      await tx.parent.create({
        data: {
          userId: user.id,
          name: enrollment.parentName,
          email: enrollment.parentEmail,
          phone: enrollment.parentPhone,
          relationship: enrollment.relationship as any || 'GUARDIAN',
          orgId,
        },
      });

      await tx.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: 'APPROVED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });

      return { userId: user.id, tempPassword };
    });

    return success({
      message: 'Enrollment approved',
      userId: result.userId,
      tempPassword: result.tempPassword,
    });
  } catch (error) {
    console.error('[Enrollment Approval Error]', error);
    return serverError('Failed to process enrollment');
  }
}