export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError, validationError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createFeeStructureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().positive(),
  dueDate: z.string(),
  academicYear: z.string(),
  term: z.number().int().min(1).max(3),
  isActive: z.boolean().default(true),
});

const updateFeeStructureSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  dueDate: z.string().optional(),
  academicYear: z.string().optional(),
  term: z.number().int().min(1).max(3).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear') || '';
    const term = searchParams.get('term');
    const isActive = searchParams.get('isActive');

    const where: any = { orgId };
    
    if (academicYear) {
      where.academicYear = academicYear;
    }

    if (term) {
      where.term = parseInt(term);
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const feeStructures = await prisma.feeStructure.findMany({
      where,
      orderBy: [{ academicYear: 'desc' }, { term: 'asc' }],
    });

    const formatted = feeStructures.map(fs => ({
      id: fs.id,
      name: fs.name,
      description: fs.description,
      amount: fs.amount,
      dueDate: fs.dueDate.toISOString(),
      academicYear: fs.academicYear,
      term: fs.term,
      isActive: fs.isActive,
      createdAt: fs.createdAt.toISOString(),
    }));

    return success({ feeStructures: formatted });
  } catch (error) {
    console.error('[Fee Structures API Error]', error);
    return serverError('Failed to fetch fee structures');
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    if (!['BURSAR', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'You do not have permission' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createFeeStructureSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { name, description, amount, dueDate, academicYear, term, isActive } = parsed.data;

    const existing = await prisma.feeStructure.findFirst({
      where: {
        orgId: session.user.orgId,
        name,
        academicYear,
        term,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Fee structure with same name, year and term already exists' },
        { status: 400 }
      );
    }

    const feeStructure = await prisma.feeStructure.create({
      data: {
        name,
        description,
        amount,
        dueDate: new Date(dueDate),
        academicYear,
        term,
        isActive,
        orgId: session.user.orgId,
      },
    });

    return success({ message: 'Fee structure created', feeStructure });
  } catch (error) {
    console.error('[Create Fee Structure Error]', error);
    return serverError('Failed to create fee structure');
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    if (!['BURSAR', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'You do not have permission' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...data } = body;
    const parsed = updateFeeStructureSchema.safeParse(data);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const existing = await prisma.feeStructure.findUnique({
      where: { id },
    });

    if (!existing || existing.orgId !== session.user.orgId) {
      return NextResponse.json({ error: 'Fee structure not found' }, { status: 404 });
    }

    const updateData: any = { ...parsed.data };
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const feeStructure = await prisma.feeStructure.update({
      where: { id },
      data: updateData,
    });

    return success({ message: 'Fee structure updated', feeStructure });
  } catch (error) {
    console.error('[Update Fee Structure Error]', error);
    return serverError('Failed to update fee structure');
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    if (!['BURSAR', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'You do not have permission' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const existing = await prisma.feeStructure.findUnique({
      where: { id },
    });

    if (!existing || existing.orgId !== session.user.orgId) {
      return NextResponse.json({ error: 'Fee structure not found' }, { status: 404 });
    }

    await prisma.feeStructure.delete({ where: { id } });

    return success({ message: 'Fee structure deleted' });
  } catch (error) {
    console.error('[Delete Fee Structure Error]', error);
    return serverError('Failed to delete fee structure');
  }
}