export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError, validationError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createBankAccountSchema = z.object({
  accountName: z.string().min(1),
  accountNumber: z.string().min(10).max(10),
  bankName: z.string().min(1),
  bankCode: z.string().optional(),
  accountType: z.string().default('current'),
  isDefault: z.boolean().default(false),
});

const updateBankAccountSchema = z.object({
  accountName: z.string().min(1).optional(),
  accountNumber: z.string().min(10).max(10).optional(),
  bankName: z.string().min(1).optional(),
  bankCode: z.string().optional(),
  accountType: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;

    const bankAccounts = await prisma.bankAccount.findMany({
      where: { orgId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    const formatted = bankAccounts.map(ba => ({
      id: ba.id,
      accountName: ba.accountName,
      accountNumber: ba.accountNumber,
      bankName: ba.bankName,
      bankCode: ba.bankCode,
      accountType: ba.accountType,
      isDefault: ba.isDefault,
      isActive: ba.isActive,
    }));

    return success({ bankAccounts: formatted });
  } catch (error) {
    console.error('[Bank Accounts API Error]', error);
    return serverError('Failed to fetch bank accounts');
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
    const parsed = createBankAccountSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { accountName, accountNumber, bankName, bankCode, accountType, isDefault } = parsed.data;

    if (isDefault) {
      await prisma.bankAccount.updateMany({
        where: { orgId: session.user.orgId },
        data: { isDefault: false },
      });
    }

    const bankAccount = await prisma.bankAccount.create({
      data: {
        accountName,
        accountNumber,
        bankName,
        bankCode,
        accountType,
        isDefault,
        orgId: session.user.orgId,
      },
    });

    return success({ message: 'Bank account created', bankAccount });
  } catch (error) {
    console.error('[Create Bank Account Error]', error);
    return serverError('Failed to create bank account');
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
    const parsed = updateBankAccountSchema.safeParse(data);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const existing = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existing || existing.orgId !== session.user.orgId) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    if (parsed.data.isDefault && !existing.isDefault) {
      await prisma.bankAccount.updateMany({
        where: { orgId: session.user.orgId, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const bankAccount = await prisma.bankAccount.update({
      where: { id },
      data: parsed.data,
    });

    return success({ message: 'Bank account updated', bankAccount });
  } catch (error) {
    console.error('[Update Bank Account Error]', error);
    return serverError('Failed to update bank account');
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

    const existing = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existing || existing.orgId !== session.user.orgId) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    await prisma.bankAccount.delete({ where: { id } });

    return success({ message: 'Bank account deleted' });
  } catch (error) {
    console.error('[Delete Bank Account Error]', error);
    return serverError('Failed to delete bank account');
  }
}