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

let resend: Resend | null = null;

const getResendClient = (): Resend | null => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

const sender = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL = process.env.APP_URL || 'https://rfid.craftinnovations.ng';
const SCHOOL_NAME = process.env.SCHOOL_NAME || 'RFID Attendance System';

export function getEmailTemplate(content: string, title?: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f8f9fa;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;padding:20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:30px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:bold;">${SCHOOL_NAME}</h1>
<p style="color:rgba(255,255,255,0.8);margin:5px 0 0 0;font-size:14px;">Enterprise RFID Attendance Management</p>
</td></tr>
<tr><td style="padding:40px 30px;">
${title ? `<h2 style="color:#1f2937;margin:0 0 20px 0;font-size:22px;font-weight:bold;">${title}</h2>` : ''}
${content}
</td></tr>
<tr><td style="background-color:#f3f4f6;padding:20px 30px;text-align:center;">
<p style="color:#6b7280;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ${SCHOOL_NAME}. All rights reserved.</p>
<p style="color:#9ca3af;font-size:11px;margin:10px 0 0 0;">This is an automated message from RFID Attendance System.<br>Please do not reply directly to this email.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  try {
    console.log('=== RESEND EMAIL SEND ATTEMPT ===');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    
    const client = getResendClient();
    if (!client) {
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    const response = await client.emails.send({
      from: sender,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });

    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function verifyResend(): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) return false;
    const result = await sendEmail({ to: 'test@example.com', subject: 'Test', html: '<p>Test</p>' });
    return result.success;
  } catch {
    return false;
  }
}

export async function sendPaymentConfirmation(to: string, studentName: string, amount: number, transactionRef: string): Promise<SendResult> {
  const content = `<p style="color:#374151;font-size:16px;margin-bottom:20px;">Dear Parent,</p>
<p style="color:#374151;font-size:16px;margin-bottom:20px;">Your payment has been received and verified.</p>
<div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0;">
<p style="margin:8px 0;"><strong>Student:</strong> ${studentName}</p>
<p style="margin:8px 0;"><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
<p style="margin:8px 0;"><strong>Reference:</strong> ${transactionRef}</p>
<p style="margin:8px 0;"><strong>Status:</strong> <span style="color:#16a34a;font-weight:bold;">VERIFIED</span></p>
</div>
<p style="color:#6b7280;font-size:14px;">Thank you for your payment.</p>`;
  
  return sendEmail({ to, subject: 'Payment Confirmation - RFID Attendance', html: getEmailTemplate(content, 'Payment Confirmation') });
}

export async function sendWelcomeEmail(to: string, name: string, role: string): Promise<SendResult> {
  const content = `<p style="color:#374151;font-size:16px;margin-bottom:20px;">Hello ${name},</p>
<p style="color:#374151;font-size:16px;margin-bottom:20px;">Your account has been created successfully as a <strong>${role}</strong>.</p>
<p style="color:#374151;font-size:16px;margin-bottom:30px;">You can now log in to the system.</p>
<div style="text-align:center;margin:30px 0;">
<a href="${APP_URL}/login" style="background:#2563eb;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;">Login to Dashboard</a>
</div>`;
  
  return sendEmail({ to, subject: 'Welcome to RFID Attendance System', html: getEmailTemplate(content, 'Welcome!') });
}

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<SendResult> {
  const content = `<p style="color:#374151;font-size:16px;margin-bottom:20px;">You requested a password reset.</p>
<div style="text-align:center;margin:30px 0;">
<a href="${APP_URL}/reset-password?token=${resetToken}" style="background:#2563eb;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;">Reset Password</a>
</div>
<p style="color:#6b7280;font-size:14px;">This link expires in 1 hour.</p>`;
  
  return sendEmail({ to, subject: 'Password Reset - RFID Attendance', html: getEmailTemplate(content, 'Password Reset Request') });
}

export async function sendAttendanceNotification(to: string, studentName: string, checkType: string, timestamp: Date): Promise<SendResult> {
  const action = checkType === 'check_in' ? 'checked in' : 'checked out';
  const content = `<p style="color:#374151;font-size:16px;margin-bottom:20px;">Dear Parent,</p>
<div style="background:#f3f4f6;padding:24px;border-radius:8px;margin:20px 0;text-align:center;">
<p style="font-size:18px;margin:0;"><strong>${studentName}</strong> has <strong>${action}</strong></p>
</div>`;
  
  return sendEmail({ to, subject: `Attendance Alert - ${studentName}`, html: getEmailTemplate(content, 'Attendance Alert') });
}

export default sendEmail;
