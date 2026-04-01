export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError, notFound } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['TEACHER', 'ADMIN', 'BURSAR']),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

// GET /api/staff - Get all staff for organization
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    
    const staff = await prisma.user.findMany({
      where: { 
        orgId,
        role: {
          in: ['TEACHER', 'ADMIN', 'BURSAR']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
        createdAt: true,
        // passwordSet and invitationSentAt will be available after DB migration
      },
      orderBy: {
        name: 'asc',
      },
    });

    return success(staff);
  } catch (error) {
    console.error('[Staff API Error]', error);
    return serverError('Failed to fetch staff');
  }
}

// POST /api/staff - Create a new staff member
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const body = await request.json();
    
    const parsed = staffSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // Check if email already exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'Email already registered',
          },
        },
        { status: 400 }
      );
    }

    // Hash password - use a temporary password that requires reset
    // User will need to use the invite feature to set their password
    const hashedPassword = await bcrypt.hash('TempPass123!', 10);

    // Create user and teacher/parent record in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          password: hashedPassword,
          role: parsed.data.role,
          orgId,
          // passwordSet: false, // Will be available after DB migration
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          imageUrl: true,
          createdAt: true,
        }
      });

      // If role is TEACHER, also create a Teacher record
      if (parsed.data.role === 'TEACHER') {
        await tx.teacher.create({
          data: {
            name: parsed.data.name,
            email: parsed.data.email,
            orgId,
          },
        });
      }

      return user;
    });

    return success(result, 201);
  } catch (error) {
    console.error('[Staff API Error]', error);
    console.error('[Staff API Error] Stack:', error instanceof Error ? error.stack : 'Unknown');
    
    // Check if it's a Prisma error
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'Email already registered',
          },
        },
        { status: 400 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: 'Failed to create staff member: ' + errorMessage,
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/staff - Update a staff member
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
        issues: [{ path: ['id'], message: 'Staff ID required' }],
        name: 'ZodError',
      } as any);
    }

    // Check if staff exists and belongs to org
    const existing = await prisma.user.findFirst({
      where: { 
        id, 
        orgId,
        role: {
          in: ['TEACHER', 'ADMIN']
        }
      }
    });

    if (!existing) {
      return notFound('Staff member');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const staff = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
        createdAt: true,
      }
    });

    return success(staff);
  } catch (error) {
    console.error('[Staff API Error]', error);
    return serverError('Failed to update staff member');
  }
}

// DELETE /api/staff - Delete a staff member
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
        issues: [{ path: ['id'], message: 'Staff ID required' }],
        name: 'ZodError',
      } as any);
    }

    // Check if staff exists and belongs to org
    const existing = await prisma.user.findFirst({
      where: { 
        id, 
        orgId,
        role: {
          in: ['TEACHER', 'ADMIN']
        }
      }
    });

    if (!existing) {
      return notFound('Staff member');
    }

    await prisma.user.delete({
      where: { id }
    });

    return success({ deleted: true });
  } catch (error) {
    console.error('[Staff API Error]', error);
    return serverError('Failed to delete staff member');
  }
}