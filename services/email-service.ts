import { 
  sendEmail as resendSendEmail,
  sendPaymentConfirmation as resendSendPaymentConfirmation,
  sendWelcomeEmail as resendSendWelcomeEmail,
  sendPasswordResetEmail as resendSendPasswordResetEmail,
  sendAttendanceNotification as resendSendAttendanceNotification,
  verifyResend
} from './resend-service';

// Use Resend API instead of SMTP for Railway compatibility
console.log('Using Resend API for email delivery');

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export async function sendEmail(options: EmailOptions) {
  try {
    console.log('=== EMAIL SEND ATTEMPT (Resend) ===');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    
    const result = await resendSendEmail({
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (result.success) {
      console.log('✅ Email sent successfully via Resend!');
      console.log('Message ID:', result.messageId);
    } else {
      console.error('❌ Email send failed via Resend');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Email send error:');
    console.error('Error:', (error as Error).message);
    
    return { 
      success: false, 
      error: (error as Error).message,
    };
  }
}

// Verify Resend connection
export async function verifySMTP() {
  try {
    console.log('Verifying Resend connection...');
    const result = await verifyResend();
    
    if (result) {
      console.log('✅ Resend connection verified');
    } else {
      console.error('❌ Resend verification failed');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Resend verification failed:');
    console.error('Error:', (error as Error).message);
    return false;
  }
}

// Send payment confirmation email
export async function sendPaymentConfirmation(
  to: string,
  studentName: string,
  amount: number,
  transactionRef: string
) {
  return resendSendPaymentConfirmation(to, studentName, amount, transactionRef);
}

// Send welcome email
export async function sendWelcomeEmail(to: string, name: string, role: string) {
  return resendSendWelcomeEmail(to, name, role);
}

// Send password reset email
export async function sendPasswordResetEmail(to: string, resetToken: string) {
  return resendSendPasswordResetEmail(to, resetToken);
}

// Send attendance notification to parent
export async function sendAttendanceNotification(
  to: string,
  studentName: string,
  checkType: string,
  timestamp: Date
) {
  return resendSendAttendanceNotification(to, studentName, checkType, timestamp);
}

export default resendSendEmail;
