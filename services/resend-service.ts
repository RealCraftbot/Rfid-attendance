import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Lazy initialization of Resend client
let resend: Resend | null = null;

const getResendClient = (): Resend | null => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

const sender = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

/**
 * Send email using Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  try {
    console.log('=== RESEND EMAIL SEND ATTEMPT ===');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('From:', sender);
    
    const client = getResendClient();
    if (!client) {
      console.warn('⚠️ RESEND_API_KEY not configured - email will not be sent');
      return { 
        success: false, 
        error: 'RESEND_API_KEY environment variable is not set'
      };
    }

    const response = await client.emails.send({
      from: sender,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
    });

    console.log('✅ Email sent successfully via Resend!');
    console.log('Message ID:', response.data?.id);
    
    return { 
      success: true, 
      messageId: response.data?.id 
    };
  } catch (error) {
    console.error('❌ Resend email send error:');
    console.error('Error name:', (error as any).name);
    console.error('Error message:', (error as any).message);
    console.error('Error status:', (error as any).status);
    console.error('Error details:', (error as any).response?.data);
    
    return { 
      success: false, 
      error: (error as Error).message,
    };
  }
}

/**
 * Verify Resend connection
 */
export async function verifyResend(): Promise<boolean> {
  try {
    console.log('Verifying Resend connection...');
    
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return false;
    }
    
    // Test by sending a simple request
    const testResult = await sendEmail({
      to: 'test@example.com',
      subject: 'Resend Connection Test',
      html: '<p>This is a test email to verify Resend connection.</p>',
    });
    
    console.log('✅ Resend connection verified');
    return testResult.success;
  } catch (error) {
    console.error('❌ Resend verification failed:');
    console.error('Error:', (error as Error).message);
    return false;
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(
  to: string,
  studentName: string,
  amount: number,
  transactionRef: string
): Promise<SendResult> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Payment Confirmation</h2>
      <p>Dear Parent,</p>
      <p>Your payment has been received and verified.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Student:</strong> ${studentName}</p>
        <p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
        <p><strong>Reference:</strong> ${transactionRef}</p>
        <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">VERIFIED</span></p>
      </div>
      
      <p>Thank you for your payment.</p>
      <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
        This is an automated message from RFID Attendance System.
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Payment Confirmation - RFID Attendance',
    html,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(to: string, name: string, role: string): Promise<SendResult> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to RFID Attendance</h2>
      <p>Hello ${name},</p>
      <p>Your account has been created successfully as a <strong>${role}</strong>.</p>
      <p>You can now log in to the system and start using our features.</p>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/login" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Login to Dashboard
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
        If you have any questions, please contact the school administration.
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to RFID Attendance System',
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<SendResult> {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>You requested a password reset for your RFID Attendance account.</p>
      
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 12px;">
        This link will expire in 1 hour. If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Password Reset - RFID Attendance',
    html,
  });
}

/**
 * Send attendance notification to parent
 */
export async function sendAttendanceNotification(
  to: string,
  studentName: string,
  checkType: string,
  timestamp: Date
): Promise<SendResult> {
  const action = checkType === 'check_in' ? 'checked in' : 'checked out';
  const time = timestamp.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Attendance Alert</h2>
      <p>Dear Parent,</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 18px; margin: 0;">
          <strong>${studentName}</strong> has ${action} at <strong>${time}</strong>
        </p>
      </div>
      
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated notification from the RFID Attendance System.
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Attendance Alert - ${studentName}`,
    html,
  });
}

/**
 * Helper function to strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export default resend;