import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError, unauthorized } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const messageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  content: z.string().min(1, 'Message content is required').max(2000, 'Message too long'),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const conversationWith = searchParams.get('userId');

    let messages;
    
    if (conversationWith) {
      messages = await prisma.message.findMany({
        where: {
          orgId,
          OR: [
            { senderId: userId, receiverId: conversationWith },
            { senderId: conversationWith, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });

      await prisma.message.updateMany({
        where: {
          receiverId: userId,
          senderId: conversationWith,
          isRead: false,
        },
        data: { isRead: true },
      });
    } else {
      const allMessages = await prisma.message.findMany({
        where: { orgId },
        orderBy: { createdAt: 'desc' },
      });

      const conversations = new Map<string, { userId: string; lastMessage: any; unread: number }>();
      
      for (const msg of allMessages) {
        const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        
        if (!conversations.has(otherUserId)) {
          conversations.set(otherUserId, { userId: otherUserId, lastMessage: msg, unread: 0 });
        }
        
        if (msg.receiverId === userId && !msg.isRead) {
          const conv = conversations.get(otherUserId)!;
          conv.unread += 1;
        }
      }

      messages = Array.from(conversations.values());
    }

    return success(messages);
  } catch (error) {
    console.error('[Messages API Error]', error);
    return serverError('Failed to fetch messages');
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId || !session?.user?.id) {
      return forbidden('Authentication required');
    }

    const orgId = session.user.orgId;
    const senderId = session.user.id;
    const senderRole = session.user.role;
    const body = await request.json();
    
    const parsed = messageSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { receiverId, content } = parsed.data;

    if (senderRole === 'PARENT' && receiverId === senderId) {
      return forbidden('Parents cannot message themselves');
    }

    if (senderRole === 'PARENT') {
      const receiver = await prisma.user.findFirst({
        where: { id: receiverId, orgId },
        select: { role: true },
      });

      if (receiver?.role !== 'TEACHER' && receiver?.role !== 'ADMIN' && receiver?.role !== 'SUPER_ADMIN') {
        return forbidden('Parents can only message Teachers or Admins');
      }
    }

    if (senderRole === 'TEACHER' || senderRole === 'ADMIN' || senderRole === 'SUPER_ADMIN') {
      const receiver = await prisma.user.findFirst({
        where: { id: receiverId, orgId },
        select: { role: true },
      });

      if (receiver?.role === 'PARENT') {
      } else if (receiver?.role !== 'TEACHER' && receiver?.role !== 'ADMIN' && receiver?.role !== 'SUPER_ADMIN') {
        return forbidden('Invalid recipient');
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        orgId,
      },
    });

    return success(message, 201);
  } catch (error) {
    console.error('[Messages API Error]', error);
    return serverError('Failed to send message');
  }
}