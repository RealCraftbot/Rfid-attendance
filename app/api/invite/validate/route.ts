export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, notFound } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return validationError({
        issues: [{ path: ['token'], message: 'Token is required' }],
        name: 'ZodError',
      } as any);
    }

    const user = await prisma.user.findFirst({
      where: { invitationToken: token },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        invitationSentAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return notFound('Invitation not found or expired');
    }

    // Check invitation expiry - use createdAt as fallback if invitationSentAt is null
    const invitationDate = user.invitationSentAt || user.createdAt;
    const invitationExpiry = new Date(invitationDate);
    invitationExpiry.setDate(invitationExpiry.getDate() + 7);

    if (new Date() > invitationExpiry) {
      return NextResponse.json({
        success: false,
        error: 'Invitation has expired',
      }, { status: 400 });
    }

    return success({
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('[Invite Validate API Error]', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to validate invitation',
    }, { status: 500 });
  }
}
