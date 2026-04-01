export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, notFound, serverError } from '@/lib/api-response';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return validationError({
        issues: [
          { path: ['token'], message: 'Token is required' },
          { path: ['password'], message: 'Password is required' },
        ],
        name: 'ZodError',
      } as any);
    }

    if (password.length < 8) {
      return validationError({
        issues: [{ path: ['password'], message: 'Password must be at least 8 characters' }],
        name: 'ZodError',
      } as any);
    }

    const user = await prisma.user.findFirst({
      where: { invitationToken: token },
    });

    if (!user) {
      return notFound('Invitation not found or expired');
    }

    const invitationExpiry = new Date(user.invitationSentAt);
    invitationExpiry.setDate(invitationExpiry.getDate() + 7);

    if (new Date() > invitationExpiry) {
      return NextResponse.json({
        success: false,
        error: 'Invitation has expired',
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordSet: true,
        invitationToken: null,
        invitationSentAt: null,
        emailVerified: new Date(),
      },
    });

    return success({ message: 'Password set successfully' });
  } catch (error) {
    console.error('[Invite Accept API Error]', error);
    return serverError('Failed to set password');
  }
}
