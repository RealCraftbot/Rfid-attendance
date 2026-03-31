export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError, validationError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'today';

    const today = new Date();
    let rangeStart: Date;
    let rangeEnd: Date;

    switch (dateRange) {
      case 'week':
        rangeStart = startOfWeek(today);
        rangeEnd = endOfWeek(today);
        break;
      case 'month':
        rangeStart = startOfMonth(today);
        rangeEnd = endOfMonth(today);
        break;
      case 'term':
        rangeStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 4) * 4, 1);
        rangeEnd = today;
        break;
      case 'today':
      default:
        rangeStart = startOfDay(today);
        rangeEnd = endOfDay(today);
    }

    const [
      totalStudents,
      verifiedPayments,
      pendingPayments,
      totalRevenue,
    ] = await Promise.all([
      prisma.student.count({
        where: { orgId, isActive: true }
      }),
      prisma.paymentTransaction.aggregate({
        where: {
          orgId,
          transactionStatus: 'VERIFIED',
          transactionDate: { gte: rangeStart, lte: rangeEnd }
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.paymentTransaction.aggregate({
        where: {
          orgId,
          transactionStatus: 'PENDING',
        },
        _count: true
      }),
      prisma.paymentTransaction.aggregate({
        where: {
          orgId,
          transactionStatus: { in: ['VERIFIED', 'COMPLETED'] },
          transactionDate: { gte: rangeStart, lte: rangeEnd }
        },
        _sum: { amount: true }
      }),
    ]);

    const overduePayments = await prisma.invoice.count({
      where: {
        orgId,
        status: 'OVERDUE',
        dueDate: { lt: today }
      }
    });

    const paidStudentsResult = await prisma.invoice.groupBy({
      by: ['studentId'],
      where: {
        orgId,
        status: 'PAID'
      },
    });
    const paidStudents = paidStudentsResult.length;

    const totalExpected = await prisma.invoice.aggregate({
      where: { orgId },
      _sum: { amount: true }
    });

    const collectionRate = totalExpected._sum.amount 
      ? Math.round(((totalRevenue._sum.amount || 0) / totalExpected._sum.amount) * 100)
      : 0;

    const recentTransactions = await prisma.paymentTransaction.findMany({
      where: { orgId },
      include: {
        invoice: {
          include: {
            student: {
              select: { name: true, classroom: { select: { name: true } } }
            }
          }
        }
      },
      orderBy: { transactionDate: 'desc' },
      take: 10
    });

    const formattedTransactions = recentTransactions.map(t => ({
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
      stats: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalExpected: totalExpected._sum.amount || 0,
        collectionRate,
        pendingPayments: pendingPayments._count,
        overduePayments,
        verifiedToday: verifiedPayments._count,
        totalStudents,
        paidStudents,
      },
      recentTransactions: formattedTransactions
    });
  } catch (error) {
    console.error('[Admin Fees API Error]', error);
    return serverError('Failed to fetch fees data');
  }
}