export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError, validationError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { z } from 'zod';

const reviewSchema = z.object({
  paymentId: z.string(),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
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
    const dateRange = searchParams.get('dateRange') || 'today';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const today = new Date();
    let rangeStart: Date;

    switch (dateRange) {
      case 'week':
        rangeStart = startOfWeek(today);
        break;
      case 'month':
        rangeStart = startOfMonth(today);
        break;
      case 'term':
        rangeStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 4) * 4, 1);
        break;
      case 'today':
      default:
        rangeStart = startOfDay(today);
    }

    const where: any = { orgId };
    
    if (status !== 'all') {
      where.transactionStatus = status;
    }

    if (dateRange !== 'all') {
      where.transactionDate = { gte: rangeStart };
    }

    if (search) {
      where.OR = [
        { paidByName: { contains: search, mode: 'insensitive' } },
        { paidByEmail: { contains: search, mode: 'insensitive' } },
        { transactionRef: { contains: search, mode: 'insensitive' } },
        { invoice: { student: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where,
        include: {
          invoice: {
            include: {
              student: {
                select: { 
                  name: true, 
                  classroom: { select: { name: true } } 
                }
              }
            }
          }
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.paymentTransaction.count({ where }),
    ]);

    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      invoiceId: t.invoiceId,
      studentName: t.invoice?.student?.name || 'Unknown',
      studentClass: t.invoice?.student?.classroom?.name || 'N/A',
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      transactionStatus: t.transactionStatus,
      proofOfPaymentUrl: t.proofOfPaymentUrl,
      paidByName: t.paidByName,
      paidByEmail: t.paidByEmail,
      paidByPhone: t.paidByPhone,
      transactionDate: t.transactionDate.toISOString(),
      transactionRef: t.transactionRef,
      notes: t.notes,
      reviewedByName: t.reviewedByName,
      reviewedAt: t.reviewedAt?.toISOString(),
      reviewNotes: t.reviewNotes,
      rejectionReason: t.rejectionReason,
    }));

    return success({
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Transactions API Error]', error);
    return serverError('Failed to fetch transactions');
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
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { paymentId, action, notes, rejectionReason } = parsed.data;

    const payment = await prisma.paymentTransaction.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });

    if (!payment || payment.orgId !== session.user.orgId) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.transactionStatus !== 'PENDING') {
      return NextResponse.json(
        { error: `Payment has already been ${payment.transactionStatus.toLowerCase()}` },
        { status: 400 }
      );
    }

    if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.paymentTransaction.update({
          where: { id: paymentId },
          data: {
            transactionStatus: 'REJECTED',
            reviewedById: session.user.id,
            reviewedByName: session.user.name || undefined,
            reviewedAt: new Date(),
            reviewNotes: notes,
            rejectionReason,
          },
        });

        const invoice = payment.invoice;
        const newPaidAmount = Math.max(0, invoice.paidAmount - payment.amount);
        const newStatus = newPaidAmount === 0 ? 'PENDING' : 'PARTIAL';

        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            paidAmount: newPaidAmount,
            status: newStatus,
            paidDate: newPaidAmount === invoice.amount ? new Date() : null,
          },
        });
      });

      return success({ message: 'Payment rejected', paymentId });
    }

    await prisma.paymentTransaction.update({
      where: { id: paymentId },
      data: {
        transactionStatus: 'VERIFIED',
        reviewedById: session.user.id,
        reviewedByName: session.user.name || undefined,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
    });

    return success({ message: 'Payment approved', paymentId });
  } catch (error) {
    console.error('[Review Payment Error]', error);
    return serverError('Failed to process payment');
  }
}