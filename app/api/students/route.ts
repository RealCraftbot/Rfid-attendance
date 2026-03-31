import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError, notFound } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const studentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email').optional().nullable(),
  rfidUid: z.string().min(4, 'RFID UID is required'),
  grade: z.string().optional().nullable(),
  classroomId: z.string().optional().nullable(),
  guardianName: z.string().optional().nullable(),
  guardianPhone: z.string().optional().nullable(),
  guardianEmail: z.string().email('Invalid guardian email').optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  admissionNumber: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  usesSchoolBus: z.boolean().default(false),
});

// GET /api/students - Get all students for organization
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    
    const students = await prisma.student.findMany({
      where: { orgId },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            grade: true,
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    return success(students);
  } catch (error) {
    console.error('[Students API Error]', error);
    return serverError('Failed to fetch students');
  }
}

// POST /api/students - Create a new student
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const body = await request.json();
    
    const parsed = studentSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // Check if RFID UID already exists
    const existing = await prisma.student.findUnique({
      where: {
        orgId_rfidUid: {
          orgId,
          rfidUid: parsed.data.rfidUid,
        }
      }
    });

    if (existing) {
      return validationError({
        issues: [{ path: ['rfidUid'], message: 'RFID UID already exists' }],
        name: 'ZodError',
      } as any);
    }

    // Generate admission number if not provided
    let admissionNumber = parsed.data.admissionNumber;
    if (!admissionNumber) {
      const count = await prisma.student.count({ where: { orgId } });
      const year = new Date().getFullYear();
      admissionNumber = `${year}/${String(count + 1).padStart(4, '0')}`;
    }

    const student = await prisma.student.create({
      data: {
        name: parsed.data.name,
        rfidUid: parsed.data.rfidUid,
        grade: parsed.data.grade || null,
        classroomId: parsed.data.classroomId || null,
        guardianName: parsed.data.guardianName || null,
        guardianPhone: parsed.data.guardianPhone || null,
        guardianEmail: parsed.data.guardianEmail || null,
        dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
        admissionNumber,
        isActive: parsed.data.isActive ?? true,
        usesSchoolBus: parsed.data.usesSchoolBus ?? false,
        orgId,
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            grade: true,
          }
        }
      }
    });

    return success(student, 201);
  } catch (error) {
    console.error('[Students API Error]', error);
    return serverError('Failed to create student');
  }
}

// PUT /api/students - Update a student
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
        issues: [{ path: ['id'], message: 'Student ID required' }],
        name: 'ZodError',
      } as any);
    }

    const parsed = studentSchema.safeParse(data);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // Check if student exists
    const existing = await prisma.student.findFirst({
      where: { id, orgId }
    });

    if (!existing) {
      return notFound('Student');
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...parsed.data,
        dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            grade: true,
          }
        }
      }
    });

    return success(student);
  } catch (error) {
    console.error('[Students API Error]', error);
    return serverError('Failed to update student');
  }
}

// DELETE /api/students - Delete a student
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
        issues: [{ path: ['id'], message: 'Student ID required' }],
        name: 'ZodError',
      } as any);
    }

    // Check if student exists
    const existing = await prisma.student.findFirst({
      where: { id, orgId }
    });

    if (!existing) {
      return notFound('Student');
    }

    await prisma.student.delete({
      where: { id }
    });

    return success({ deleted: true });
  } catch (error) {
    console.error('[Students API Error]', error);
    return serverError('Failed to delete student');
  }
}