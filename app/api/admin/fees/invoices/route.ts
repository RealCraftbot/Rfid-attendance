export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError, validationError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createInvoiceSchema = z.object({
  studentId: z.string(),
  feeStructureId: z.string(),
  dueDate: z.string(),
  academicYear: z.string(),
  term: z.number().int().min(1).max(3),
  description: z.string().optional(),
});

const updateInvoiceSchema = z.object({
  amount: z.number().positive().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE']).optional(),
  paidAmount: z.number().min(0).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const academicYear = searchParams.get('academicYear') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = { orgId };
    
    if (status !== 'all') {
      where.status = status;
    }

    if (academicYear) {
      where.academicYear = academicYear;
    }

    if (search) {
      where.OR = [
        { student: { name: { contains: search, mode: 'insensitive' } } },
        { student: { admissionNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          student: {
            select: { 
              id: true,
              name: true, 
              admissionNumber: true,
              classroom: { select: { name: true } }
            }
          },
          feeStructure: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    const formattedInvoices = invoices.map(inv => ({
      id: inv.id,
      studentId: inv.studentId,
      studentName: inv.student.name,
      studentClass: inv.student.classroom?.name || 'N/A',
      admissionNumber: inv.student.admissionNumber || 'N/A',
      amount: inv.amount,
      paidAmount: inv.paidAmount,
      status: inv.status,
      dueDate: inv.dueDate.toISOString(),
      academicYear: inv.academicYear,
      term: inv.term,
      feeName: inv.feeStructure.name,
      description: inv.description,
      createdAt: inv.createdAt.toISOString(),
    }));

    return success({
      invoices: formattedInvoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Invoices API Error]', error);
    return serverError('Failed to fetch invoices');
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
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { studentId, feeStructureId, dueDate, academicYear, term, description } = parsed.data;

    const [student, feeStructure] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.feeStructure.findUnique({ where: { id: feeStructureId } }),
    ]);

    if (!student || student.orgId !== session.user.orgId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!feeStructure || feeStructure.orgId !== session.user.orgId) {
      return NextResponse.json({ error: 'Fee structure not found' }, { status: 404 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        feeStructureId,
        orgId: session.user.orgId,
        amount: feeStructure.amount,
        dueDate: new Date(dueDate),
        academicYear,
        term,
        description,
      },
    });

    return success({ message: 'Invoice created', invoice });
  } catch (error) {
    console.error('[Create Invoice Error]', error);
    return serverError('Failed to create invoice');
  }
}