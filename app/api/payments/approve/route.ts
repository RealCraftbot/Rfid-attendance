import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const approvePaymentSchema = z.object({
  paymentId: z.string(),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only bursars, admins, and super admins can approve/reject payments
    if (!['BURSAR', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to approve payments' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = approvePaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { paymentId, action, notes, rejectionReason } = validation.data;

    // Get the payment transaction
    const payment = await prisma.paymentTransaction.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Verify this payment belongs to the same org
    if (payment.orgId !== session.user.orgId) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if payment is already processed
    if (payment.transactionStatus !== 'PENDING') {
      return NextResponse.json(
        { error: `Payment has already been ${payment.transactionStatus.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Handle rejection
    if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Rejection reason is required when rejecting a payment' },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        // Update payment status
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

        // Revert the invoice paid amount
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

      return NextResponse.json({
        success: true,
        message: 'Payment rejected successfully',
        payment: {
          id: payment.id,
          status: 'REJECTED',
          reviewedAt: new Date(),
        },
      });
    }

    // Handle approval
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

    return NextResponse.json({
      success: true,
      message: 'Payment approved successfully',
      payment: {
        id: payment.id,
        status: 'VERIFIED',
        reviewedAt: new Date(),
      },
    });

  } catch (error) {
    console.error('Payment approval error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment approval' },
      { status: 500 }
    );
  }
}

// Get pending payments for review
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only bursars, admins, and super admins can view pending payments
    if (!['BURSAR', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to view pending payments' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Ensure orgId exists
    if (!session.user.orgId) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'VERIFIED', 'REJECTED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status filter' },
        { status: 400 }
      );
    }

    const [payments, total] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where: {
          orgId: session.user.orgId,
          transactionStatus: status as any,
        },
        include: {
          invoice: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  admissionNumber: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.paymentTransaction.count({
        where: {
          orgId: session.user.orgId,
          transactionStatus: status as any,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get pending payments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
