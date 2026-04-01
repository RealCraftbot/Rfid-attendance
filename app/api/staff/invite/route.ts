export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError, notFound } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail, getEmailTemplate } from '@/services/email-service';

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

    const inviteUrl = `${process.env.APP_URL || 'https://rfid.craftinnovations.ng'}/invite?token=${invitationToken}`;
    const schoolName = process.env.SCHOOL_NAME || 'RFID Attendance';
    
    const content = `
      <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">Hello ${staffMember.name},</p>
      <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">You have been invited to join <strong>${org?.name || 'the school'}</strong> as a <strong style="color: #2563eb;">${staffMember.role.toLowerCase()}</strong>.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteUrl}" 
           style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          Accept Invitation & Set Password
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">This invitation will expire in 7 days.</p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">If you didn't expect this invitation, please ignore this email.</p>
    `;

    // Import the email template
    const emailHtml = getEmailTemplate(content, 'You\'re Invited!');
    
    const emailResult = await sendEmail({
      to: email,
      subject: `Invitation to join ${org?.name || 'RFID Attendance'}`,
      html: emailHtml,
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
