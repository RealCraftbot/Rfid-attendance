import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError, notFound } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createParentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  relationship: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']).default('GUARDIAN'),
  address: z.string().optional(),
  idNumber: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

const updateParentSchema = createParentSchema.partial();

// GET /api/parents/manage - Get all parents for organization (admin endpoint)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    
    const parents = await prisma.parent.findMany({
      where: { orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            imageUrl: true,
            createdAt: true,
          }
        },
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                rfidUid: true,
                grade: true,
                isActive: true,
                classroom: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formattedParents = parents.map(parent => ({
      id: parent.id,
      userId: parent.userId,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      relationship: parent.relationship,
      address: parent.address,
      idNumber: parent.idNumber,
      imageUrl: parent.user.imageUrl,
      createdAt: parent.user.createdAt,
      students: parent.students.map(sp => ({
        ...sp.student,
        relationship: sp.relationship,
        isPrimary: sp.isPrimary,
        studentParentId: sp.id,
      })),
      studentCount: parent.students.length
    }));

    return success(formattedParents);
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
    
    const parsed = createParentSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // Check if email already exists as user
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (existingUser) {
      return validationError({
        issues: [{ path: ['email'], message: 'Email already registered' }],
        name: 'ZodError',
      } as any);
    }

    // Hash password if provided
    const hashedPassword = parsed.data.password 
      ? await bcrypt.hash(parsed.data.password, 10)
      : await bcrypt.hash('Parent123!', 10);

    // Create user and parent in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          password: hashedPassword,
          role: 'PARENT',
          orgId,
        },
      });

      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          relationship: parsed.data.relationship,
          address: parsed.data.address,
          idNumber: parsed.data.idNumber,
          orgId,
        },
        include: {
          students: {
            include: {
              student: true
            }
          }
        }
      });

      return parent;
    });

    return success({
      id: result.id,
      userId: result.userId,
      name: result.name,
      email: result.email,
      phone: result.phone,
      relationship: result.relationship,
      students: [],
      studentCount: 0
    }, 201);
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

    const parsed = updateParentSchema.safeParse(data);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // Check if parent exists and belongs to org
    const existing = await prisma.parent.findFirst({
      where: { id, orgId }
    });

    if (!existing) {
      return notFound('Parent');
    }

    // Update both user and parent
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existing.userId },
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
        },
      });

      await tx.parent.update({
        where: { id },
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          relationship: parsed.data.relationship,
          address: parsed.data.address,
          idNumber: parsed.data.idNumber,
        },
      });
    });

    const updated = await prisma.parent.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    });

    return success({
      id: updated!.id,
      userId: updated!.userId,
      name: updated!.name,
      email: updated!.email,
      phone: updated!.phone,
      relationship: updated!.relationship,
      students: updated!.students.map(sp => sp.student),
      studentCount: updated!.students.length
    });
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
    const existing = await prisma.parent.findFirst({
      where: { id, orgId }
    });

    if (!existing) {
      return notFound('Parent');
    }

    // Delete parent and user (user deletion cascades)
    await prisma.$transaction(async (tx) => {
      await tx.parent.delete({ where: { id } });
      await tx.user.delete({ where: { id: existing.userId } });
    });

    return success({ deleted: true });
  } catch (error) {
    console.error('[Parents API Error]', error);
    return serverError('Failed to delete parent');
  }
}