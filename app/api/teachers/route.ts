import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const teacherSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  subject: z.string().optional(),
  qualification: z.string().optional(),
  address: z.string().optional(),
});

// GET /api/teachers - Retrieve all teachers for an organization
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { orgId } = session?.user || {};
    
    if (!orgId) {
      return forbidden('Organization ID is required');
    }
    
    const teachers = await prisma.teacher.findMany({
      where: { orgId, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        employeeId: true,
        subject: true,
        qualification: true,
      },
      orderBy: { name: 'asc' }
    });
    
    return success(teachers);
  } catch (error) {
    console.error('[Teachers API Error]', error);
    return serverError('Failed to retrieve teachers');
  }
}

// POST /api/teachers - Create a new teacher
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { orgId } = session?.user || {};
    
    if (!orgId) {
      return forbidden('Organization ID is required');
    }
    
    const body = await request.json();
    const parsed = teacherSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    
    // Check if email already exists
    const existing = await prisma.teacher.findFirst({
      where: { email: parsed.data.email, orgId }
    });
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A teacher with this email already exists' },
        { status: 400 }
      );
    }
    
    const teacher = await prisma.teacher.create({
      data: {
        ...parsed.data,
        orgId
      }
    });
    
    return success(teacher, 201);
  } catch (error) {
    console.error('[Teachers API Error]', error);
    return serverError('Failed to create teacher');
  }
}

// PUT /api/teachers - Update a teacher
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { orgId } = session?.user || {};
    
    if (!orgId) {
      return forbidden('Organization ID is required');
    }
    
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Teacher ID required' }, { status: 400 });
    }
    
    const existing = await prisma.teacher.findFirst({ where: { id, orgId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }
    
    const teacher = await prisma.teacher.update({
      where: { id },
      data
    });
    
    return success(teacher);
  } catch (error) {
    console.error('[Teachers API Error]', error);
    return serverError('Failed to update teacher');
  }
}

// DELETE /api/teachers - Delete a teacher
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { orgId } = session?.user || {};
    
    if (!orgId) {
      return forbidden('Organization ID is required');
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Teacher ID required' }, { status: 400 });
    }
    
    const existing = await prisma.teacher.findFirst({ where: { id, orgId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }
    
    await prisma.teacher.delete({ where: { id } });
    
    return success({ deleted: true });
  } catch (error) {
    console.error('[Teachers API Error]', error);
    return serverError('Failed to delete teacher');
  }
}