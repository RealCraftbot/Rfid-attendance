import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/services/email-service';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST - Send OTP
export async function POST(req: NextRequest) {
  try {
    const { email, type = 'verification' } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store OTP in database - delete any existing token for this email first
    await prisma.verificationToken.deleteMany({
      where: { email },
    });
    
    // Create new OTP record
    const createdRecord = await prisma.verificationToken.create({
      data: {
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        expiresAt,
      },
    });
    
    // Verify the record was created by reading it back
    const verifyRecord = await prisma.verificationToken.findFirst({
      where: { id: createdRecord.id },
    });
    console.log('Record verification after creation:', !!verifyRecord);

    console.log('OTP Creation Debug:');
    console.log('Email:', email);
    console.log('Email (trimmed/lowercase):', email.trim().toLowerCase());
    console.log('OTP Generated:', otp);
    console.log('OTP Generated (trimmed):', otp.trim());
    console.log('Record Created:', createdRecord);

    // Send OTP via email
    const subject = type === 'password-reset' 
      ? 'Password Reset - OTP Verification'
      : 'Email Verification - RFID Attendance';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">${type === 'password-reset' ? 'Password Reset' : 'Email Verification'}</h2>
        <p>Hello,</p>
        <p>Your OTP code is:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h1 style="color: #2563eb; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
        </div>
        
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
          This is an automated message from RFID Attendance System.<br>
          Do not reply to this email.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: email,
      subject,
      html,
    });

    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      email: email,
    });

  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

// PUT - Verify OTP
export async function PUT(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Find the OTP record by email and token
    const verificationRecord = await prisma.verificationToken.findFirst({
      where: { 
        email: email.trim().toLowerCase(),
        token: otp.trim(),
      },
    });

    console.log('OTP Verification Debug:');
    console.log('Email:', email);
    console.log('Email (trimmed/lowercase):', email.trim().toLowerCase());
    console.log('OTP Provided:', otp);
    console.log('OTP Provided (trimmed):', otp.trim());
    console.log('OTP Type:', typeof otp);
    console.log('Record Found:', !!verificationRecord);
    console.log('Record:', verificationRecord);
    
    // Debug: Check all records for this email
    const allRecords = await prisma.verificationToken.findMany({
      where: { email: email.trim().toLowerCase() },
    });
    console.log('All records for this email:', allRecords);

    if (!verificationRecord) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
    }

    // Check if OTP is expired
    if (new Date() > verificationRecord.expiresAt) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { id: verificationRecord.id },
      });
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Delete the used OTP
    await prisma.verificationToken.delete({
      where: { id: verificationRecord.id },
    });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      email,
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
