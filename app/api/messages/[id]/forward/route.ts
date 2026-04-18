import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError, notFound } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const forwardSchema = z.object({
  newRecipientId: z.string().min(1, 'Recipient ID is required'),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId || !session?.user?.id) {
      return forbidden('Authentication required');
    }

    const { id } = await params;
    const orgId = session.user.orgId;
    const senderId = session.user.id;
    const senderRole = session.user.role;
    const body = await request.json();
    
    const parsed = forwardSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const originalMessage = await prisma.message.findFirst({
      where: { id, orgId },
    });

    if (!originalMessage) {
      return notFound('Original message');
    }

    const { newRecipientId } = parsed.data;

    if (senderRole === 'PARENT') {
      const receiver = await prisma.user.findFirst({
        where: { id: newRecipientId, orgId },
        select: { role: true },
      });

      if (receiver?.role !== 'TEACHER' && receiver?.role !== 'ADMIN' && receiver?.role !== 'SUPER_ADMIN') {
        return forbidden('Parents can only forward to Teachers or Admins');
      }
    }

    if (senderRole === 'TEACHER' || senderRole === 'ADMIN' || senderRole === 'SUPER_ADMIN') {
      const receiver = await prisma.user.findFirst({
        where: { id: newRecipientId, orgId },
        select: { role: true },
      });

      if (receiver?.role === 'PARENT') {
      } else if (receiver?.role !== 'TEACHER' && receiver?.role !== 'ADMIN' && receiver?.role !== 'SUPER_ADMIN') {
        return forbidden('Invalid recipient');
      }
    }

    const forwardedMessage = await prisma.message.create({
      data: {
        content: `Forwarded: ${originalMessage.content}`,
        senderId,
        receiverId: newRecipientId,
        orgId,
      },
    });

    return success(forwardedMessage, 201);
  } catch (error) {
    console.error('[Forward Message API Error]', error);
    return serverError('Failed to forward message');
  }
}