import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const classroomSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  teacherId: z.string().optional(),
  grade: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { orgId } = session?.user || {};
    
    if (!orgId) {
      return forbidden('Organization ID is required');
    }
    
    const classrooms = await prisma.classroom.findMany({
      where: { orgId },
      include: {
        students: {
          where: { isActive: true },
          select: { id: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    const formattedClassrooms = classrooms.map(c => ({
      id: c.id,
      name: c.name,
      teacherId: c.teacherId,
      grade: c.grade,
      studentCount: c.students.length
    }));
    
    return success(formattedClassrooms);
  } catch (error) {
    console.error('[Classrooms API Error]', error);
    return serverError('Failed to retrieve classrooms');
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { orgId } = session?.user || {};
    
    if (!orgId) {
      return forbidden('Organization ID is required');
    }
    
    const body = await request.json();
    const parsed = classroomSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    
    // Check if classroom with same name already exists
    const existing = await prisma.classroom.findFirst({
      where: {
        orgId,
        name: parsed.data.name
      }
    });
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A classroom with this name already exists' },
        { status: 400 }
      );
    }
    
    const classroom = await prisma.classroom.create({
      data: {
        name: parsed.data.name,
        teacherId: parsed.data.teacherId || null,
        grade: parsed.data.grade || null,
        orgId
      }
    });
    
    return success(classroom, 201);
  } catch (error) {
    console.error('[Classrooms API Error]', error);
    return serverError('Failed to create classroom');
  }
}

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
      return NextResponse.json({ success: false, error: 'Classroom ID required' }, { status: 400 });
    }
    
    const existing = await prisma.classroom.findFirst({ where: { id, orgId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Classroom not found' }, { status: 404 });
    }
    
    const classroom = await prisma.classroom.update({
      where: { id },
      data: {
        name: data.name,
        teacherId: data.teacherId,
        grade: data.grade
      }
    });
    
    return success(classroom);
  } catch (error) {
    console.error('[Classrooms API Error]', error);
    return serverError('Failed to update classroom');
  }
}

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
      return NextResponse.json({ success: false, error: 'Classroom ID required' }, { status: 400 });
    }
    
    const existing = await prisma.classroom.findFirst({ where: { id, orgId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Classroom not found' }, { status: 404 });
    }
    
    await prisma.classroom.delete({ where: { id } });
    
    return success({ deleted: true });
  } catch (error) {
    console.error('[Classrooms API Error]', error);
    return serverError('Failed to delete classroom');
  }
}