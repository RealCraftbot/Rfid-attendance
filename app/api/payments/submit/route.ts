import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const submitPaymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CASH', 'CHEQUE', 'POS', 'ONLINE']),
  transactionRef: z.string().optional(),
  notes: z.string().optional(),
  proofOfPaymentUrl: z.string().url().optional(),
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

    // Only parents can submit payments for their children
    if (session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Only parents can submit payments through this endpoint' },
        { status: 403 }
      );
    }

    // Ensure orgId exists
    if (!session.user.orgId) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validation = submitPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      invoiceId,
      amount,
      paymentMethod,
      transactionRef,
      notes,
      proofOfPaymentUrl,
    } = validation.data;

    // Get the invoice and verify parent has access
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { student: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Verify this invoice belongs to a student from the same org
    if (invoice.orgId !== session.user.orgId) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // In a real app, you'd verify the parent is associated with this student
    // For now, we'll allow any parent from the org to submit payments
    // TODO: Add parent-student relationship check

    // Validate amount doesn't exceed invoice amount
    const totalPaid = invoice.paidAmount + amount;
    if (totalPaid > invoice.amount) {
      return NextResponse.json(
        { error: 'Payment amount exceeds invoice balance' },
        { status: 400 }
      );
    }

    // Create payment transaction
    const payment = await prisma.$transaction(async (tx) => {
      // Create the payment transaction
      const transaction = await tx.paymentTransaction.create({
        data: {
          invoiceId,
          orgId: invoice.orgId,
          amount,
          paymentMethod,
          transactionRef,
          notes,
          proofOfPaymentUrl,
          paidByUserId: session.user.id,
          paidByName: session.user.name || undefined,
          paidByEmail: session.user.email || undefined,
        },
      });

      // Update invoice paid amount
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: totalPaid,
          status: totalPaid >= invoice.amount ? 'PAID' : 'PARTIAL',
          paidDate: totalPaid >= invoice.amount ? new Date() : undefined,
        },
      });

      return transaction;
    });

    return NextResponse.json({
      success: true,
      message: 'Payment submitted successfully and pending verification',
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.transactionStatus,
        submittedAt: payment.createdAt,
      },
    });

  } catch (error) {
    console.error('Payment submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit payment' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
