import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json();

    // Verify the user is verifying their own email
    if (email !== session.user.email) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 403 });
    }

    // Update user's emailVerified status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
