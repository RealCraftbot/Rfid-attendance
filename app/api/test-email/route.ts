import { NextRequest, NextResponse } from 'next/server';
import { verifySMTP, sendEmail } from '@/services/email-service';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing Resend connection...');
    console.log('RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);

    // Test connection
    const isConnected = await verifySMTP();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Resend connection failed',
        config: {
          hasApiKey: !!process.env.RESEND_API_KEY,
          fromEmail: process.env.RESEND_FROM_EMAIL,
          service: 'Resend'
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Resend connection successful',
      config: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.RESEND_FROM_EMAIL,
        service: 'Resend'
      }
    });

  } catch (error) {
    console.error('Resend test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('Sending test email via Resend to:', email);

    const result = await sendEmail({
      to: email,
      subject: 'Test Email - RFID Attendance (Resend)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Resend Test Email</h2>
          <p>This is a test email from RFID Attendance system using Resend API.</p>
          <p>If you received this, your Resend configuration is working!</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
            Sent via Resend at: ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully via Resend',
        messageId: result.messageId,
        service: 'Resend'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        service: 'Resend'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Resend test email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      service: 'Resend'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
