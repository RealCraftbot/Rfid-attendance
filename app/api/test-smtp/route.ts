import { NextRequest, NextResponse } from 'next/server';
import { verifySMTP, sendEmail } from '@/services/email-service';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing SMTP connection...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_FROM:', process.env.SMTP_FROM);

    // Test connection
    const isConnected = await verifySMTP();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'SMTP connection failed',
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          from: process.env.SMTP_FROM,
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'SMTP connection successful',
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM,
      }
    });

  } catch (error) {
    console.error('SMTP test error:', error);
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

    console.log('Sending test email to:', email);

    const result = await sendEmail({
      to: email,
      subject: 'Test Email - RFID Attendance',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test Email</h2>
          <p>This is a test email from RFID Attendance system.</p>
          <p>If you received this, your SMTP configuration is working!</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
