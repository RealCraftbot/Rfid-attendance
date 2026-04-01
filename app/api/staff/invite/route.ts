export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError, notFound } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/services/email-service';

function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return validationError({
        issues: [{ path: ['email'], message: 'Email is required' }],
        name: 'ZodError',
      } as any);
    }

    const staffMember = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        orgId,
        role: { in: ['TEACHER', 'ADMIN', 'BURSAR'] }
      }
    });

    if (!staffMember) {
      return notFound('Staff member');
    }

    // Generate invitation token
    const invitationToken = generateInvitationToken();

    // Try to update user with invitation token (will fail if fields don't exist in DB)
    let tokenStored = false;
    try {
      await prisma.user.update({
        where: { id: staffMember.id },
        data: {
          invitationToken,
          invitationSentAt: new Date(),
        },
      });
      tokenStored = true;
    } catch (updateError) {
      console.log('Note: invitationToken fields not available yet in DB');
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true }
    });

    const inviteUrl = `${process.env.APP_URL}/invite?token=${invitationToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">You're invited to join ${org?.name || 'RFID Attendance'}</h2>
        <p>Hello ${staffMember.name},</p>
        <p>You have been invited to join ${org?.name || 'the school'} as a ${staffMember.role.toLowerCase()}.</p>
        
        <div style="margin: 30px 0;">
          <a href="${inviteUrl}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation & Set Password
          </a>
        </div>
        
        <p>This invitation will expire in 7 days.</p>
        <p style="color: #6b7280; font-size: 12px;">
          If you didn't expect this invitation, please ignore this email.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: email,
      subject: `Invitation to join ${org?.name || 'RFID Attendance'}`,
      html,
    });

    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error);
      return serverError('Failed to send invitation email');
    }

    return success({ message: 'Invitation sent successfully', tokenStored });
  } catch (error) {
    console.error('[Staff Invite API Error]', error);
    return serverError('Failed to send invitation');
  }
}
