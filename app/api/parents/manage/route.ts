import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError, notFound } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const parentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

// GET /api/parents/manage - Get all parents for organization (admin endpoint)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    
    const parents = await prisma.user.findMany({
      where: { 
        orgId,
        role: 'PARENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get students for each parent
    const parentsWithStudents = await Promise.all(
      parents.map(async (parent) => {
        const students = await prisma.student.findMany({
          where: {
            guardianEmail: parent.email
          },
          select: {
            id: true,
            name: true,
            grade: true,
            rfidUid: true,
            isActive: true,
          }
        });
        
        return {
          ...parent,
          students,
          studentCount: students.length
        };
      })
    );

    return success(parentsWithStudents);
  } catch (error) {
    console.error('[Parents API Error]', error);
    return serverError('Failed to fetch parents');
  }
}

// POST /api/parents/manage - Create a new parent
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const body = await request.json();
    
    const parsed = parentSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (existing) {
      return validationError({
        issues: [{ path: ['email'], message: 'Email already registered' }],
        name: 'ZodError',
      } as any);
    }

    // Hash password if provided
    const hashedPassword = parsed.data.password 
      ? await bcrypt.hash(parsed.data.password, 10)
      : await bcrypt.hash('Parent123!', 10); // Default password

    const parent = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashedPassword,
        role: 'PARENT',
        orgId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        createdAt: true,
      }
    });

    return success(parent, 201);
  } catch (error) {
    console.error('[Parents API Error]', error);
    return serverError('Failed to create parent');
  }
}

// PUT /api/parents/manage - Update a parent
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
        issues: [{ path: ['id'], message: 'Parent ID required' }],
        name: 'ZodError',
      } as any);
    }

    const parsed = parentSchema.partial().safeParse(data);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // Check if parent exists and belongs to org
    const existing = await prisma.user.findFirst({
      where: { 
        id, 
        orgId,
        role: 'PARENT'
      }
    });

    if (!existing) {
      return notFound('Parent');
    }

    // Hash password if provided
    const updateData: any = {};
    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.email) updateData.email = parsed.data.email;
    if (parsed.data.password) {
      updateData.password = await bcrypt.hash(parsed.data.password, 10);
    }

    const parent = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        createdAt: true,
      }
    });

    return success(parent);
  } catch (error) {
    console.error('[Parents API Error]', error);
    return serverError('Failed to update parent');
  }
}

// DELETE /api/parents/manage - Delete a parent
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
        issues: [{ path: ['id'], message: 'Parent ID required' }],
        name: 'ZodError',
      } as any);
    }

    // Check if parent exists and belongs to org
    const existing = await prisma.user.findFirst({
      where: { 
        id, 
        orgId,
        role: 'PARENT'
      }
    });

    if (!existing) {
      return notFound('Parent');
    }

    await prisma.user.delete({
      where: { id }
    });

    return success({ deleted: true });
  } catch (error) {
    console.error('[Parents API Error]', error);
    return serverError('Failed to delete parent');
  }
}