import nodemailer from 'nodemailer';

// Try multiple cPanel SMTP configurations
const createTransporter = () => {
  // Option 1: Port 587 with STARTTLS (most common for cPanel)
  const config587 = {
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: true, // Enable debug logging
    logger: true,
  };

  // Option 2: Port 465 with SSL (older cPanel)
  const config465 = {
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: true,
    logger: true,
  };

  // Option 3: Port 25 (if others fail - often blocked)
  const config25 = {
    host: process.env.SMTP_HOST,
    port: 25,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: true,
    logger: true,
  };

  console.log('Creating SMTP transporter with config:', {
    host: process.env.SMTP_HOST,
    user: process.env.SMTP_USER,
    attemptedPort: process.env.SMTP_PORT || '587',
  });

  // Use the port specified in env, default to 587
  const port = parseInt(process.env.SMTP_PORT || '587');
  let config = config587;
  
  if (port === 465) config = config465;
  if (port === 25) config = config25;

  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

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
    console.log('=== EMAIL SEND ATTEMPT ===');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('From:', process.env.SMTP_FROM);
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT || '587');
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:');
    console.error('Error name:', (error as any).name);
    console.error('Error message:', (error as any).message);
    console.error('Error code:', (error as any).code);
    console.error('Error command:', (error as any).command);
    console.error('Error response:', (error as any).response);
    console.error('Error responseCode:', (error as any).responseCode);
    
    return { 
      success: false, 
      error: (error as Error).message,
      code: (error as any).code,
      response: (error as any).response,
    };
  }
}

// Verify SMTP connection
export async function verifySMTP() {
  try {
    console.log('Verifying SMTP connection to:', process.env.SMTP_HOST);
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ SMTP verification failed:');
    console.error('Error:', (error as Error).message);
    console.error('Code:', (error as any).code);
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

// Send welcome email
export async function sendWelcomeEmail(to: string, name: string, role: string) {
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

// Send password reset email
export async function sendPasswordResetEmail(to: string, resetToken: string) {
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

// Send attendance notification to parent
export async function sendAttendanceNotification(
  to: string,
  studentName: string,
  checkType: string,
  timestamp: Date
) {
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

export default transporter;
