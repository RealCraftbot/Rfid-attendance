import nodemailer from 'nodemailer';

interface SMSOptions {
  to: string;
  message: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface NotificationData {
  recipientName: string;
  studentName?: string;
  checkType?: string;
  timestamp?: Date;
  location?: string;
  amount?: number;
  feeName?: string;
  balance?: number;
}

// Initialize SMTP transporter
const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send SMS using Termii API
 * Termii is a popular Nigerian SMS gateway
 */
export async function sendSMS({ to, message }: SMSOptions): Promise<boolean> {
  try {
    const apiKey = process.env.TERMII_API_KEY;
    const senderId = process.env.TERMII_SENDER_ID || 'RFIDSCHOOL';

    if (!apiKey) {
      console.warn('Termii API key not configured. SMS not sent.');
      return false;
    }

    // Format phone number (ensure +234 prefix)
    let formattedPhone = to.replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+234' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        to: formattedPhone,
        from: senderId,
        sms: message,
        type: 'plain',
        channel: 'generic',
      }),
    });

    const data = await response.json();

    if (data.code === 'ok' || data.message_id) {
      console.log('SMS sent successfully:', data);
      return true;
    } else {
      console.error('SMS sending failed:', data);
      return false;
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

/**
 * Send email using SMTP
 */
export async function sendEmail({ to, subject, text, html }: EmailOptions): Promise<boolean> {
  try {
    const from = process.env.SMTP_FROM || 'RFID Attendance <noreply@example.com>';

    const info = await smtpTransporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send attendance notification (check-in/check-out)
 */
export async function sendAttendanceNotification(
  phone: string,
  email: string,
  data: NotificationData
): Promise<void> {
  const { recipientName, studentName, checkType, timestamp, location } = data;
  
  const timeString = timestamp ? new Date(timestamp).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Lagos',
  }) : '';

  const checkTypeLabel = getCheckTypeLabel(checkType);
  
  // SMS Message
  const smsMessage = `Dear ${recipientName}, ${studentName} has ${checkTypeLabel} at ${timeString}${location ? ` (${location})` : ''}. - RFID Attendance`;
  
  // Email Content
  const emailSubject = `Attendance Alert: ${studentName}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Attendance Notification</h2>
      <p>Dear ${recipientName},</p>
      <p><strong>${studentName}</strong> has <strong>${checkTypeLabel}</strong> at <strong>${timeString}</strong>${location ? ` at ${location}` : ''}.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #6b7280; font-size: 12px;">This is an automated notification from RFID Attendance System.</p>
    </div>
  `;

  // Send both SMS and Email
  await Promise.all([
    sendSMS({ to: phone, message: smsMessage }),
    sendEmail({ to: email, subject: emailSubject, html: emailHtml }),
  ]);
}

/**
 * Send bus status notification
 */
export async function sendBusNotification(
  phone: string,
  email: string,
  data: NotificationData
): Promise<void> {
  const { recipientName, studentName, checkType, timestamp } = data;
  
  const timeString = timestamp ? new Date(timestamp).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Lagos',
  }) : '';

  const busStatusLabel = getBusStatusLabel(checkType);
  
  // SMS Message
  const smsMessage = `Dear ${recipientName}, ${studentName} is ${busStatusLabel} at ${timeString}. - RFID Attendance`;
  
  // Email Content
  const emailSubject = `Bus Update: ${studentName}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Bus Status Update</h2>
      <p>Dear ${recipientName},</p>
      <p><strong>${studentName}</strong> is <strong>${busStatusLabel}</strong> at <strong>${timeString}</strong>.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #6b7280; font-size: 12px;">This is an automated notification from RFID Attendance System.</p>
    </div>
  `;

  await Promise.all([
    sendSMS({ to: phone, message: smsMessage }),
    sendEmail({ to: email, subject: emailSubject, html: emailHtml }),
  ]);
}

/**
 * Send fee payment notification
 */
export async function sendFeeNotification(
  phone: string,
  email: string,
  data: NotificationData
): Promise<void> {
  const { recipientName, studentName, amount, feeName, balance } = data;
  
  const amountFormatted = amount ? `₦${amount.toLocaleString()}` : '';
  const balanceFormatted = balance ? `₦${balance.toLocaleString()}` : '';
  
  // SMS Message
  let smsMessage = `Dear ${recipientName}, `;
  if (amount && amount > 0) {
    smsMessage += `payment of ${amountFormatted} for ${studentName}'s ${feeName} received. `;
  } else {
    smsMessage += `fee reminder: ${studentName}'s ${feeName} is due. `;
  }
  if (balance && balance > 0) {
    smsMessage += `Outstanding balance: ${balanceFormatted}. `;
  }
  smsMessage += '- RFID Attendance';
  
  // Email Content
  const emailSubject = amount && amount > 0 
    ? `Payment Received: ${studentName}` 
    : `Fee Reminder: ${studentName}`;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">${amount && amount > 0 ? 'Payment Confirmation' : 'Fee Reminder'}</h2>
      <p>Dear ${recipientName},</p>
      ${amount && amount > 0 
        ? `<p>We have received your payment of <strong>${amountFormatted}</strong> for <strong>${studentName}</strong>'s <strong>${feeName}</strong>.</p>`
        : `<p>This is a reminder that <strong>${studentName}</strong>'s <strong>${feeName}</strong> is now due.</p>`
      }
      ${balance && balance > 0 
        ? `<p>Outstanding balance: <strong>${balanceFormatted}</strong></p>`
        : '<p>Thank you for your prompt payment!</p>'
      }
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #6b7280; font-size: 12px;">This is an automated notification from RFID Attendance System.</p>
    </div>
  `;

  await Promise.all([
    sendSMS({ to: phone, message: smsMessage }),
    sendEmail({ to: email, subject: emailSubject, html: emailHtml }),
  ]);
}

/**
 * Send grade publication notification
 */
export async function sendGradeNotification(
  phone: string,
  email: string,
  data: NotificationData
): Promise<void> {
  const { recipientName, studentName } = data;
  
  // SMS Message
  const smsMessage = `Dear ${recipientName}, ${studentName}'s report card for this term is now available. Please log in to view. - RFID Attendance`;
  
  // Email Content
  const emailSubject = `Report Card Available: ${studentName}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Report Card Available</h2>
      <p>Dear ${recipientName},</p>
      <p><strong>${studentName}</strong>'s report card for this term is now available.</p>
      <p>Please log in to your parent portal to view the full report.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #6b7280; font-size: 12px;">This is an automated notification from RFID Attendance System.</p>
    </div>
  `;

  await Promise.all([
    sendSMS({ to: phone, message: smsMessage }),
    sendEmail({ to: email, subject: emailSubject, html: emailHtml }),
  ]);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<void> {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
  
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset</h2>
      <p>Dear ${userName},</p>
      <p>You requested a password reset for your RFID Attendance account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
      <p style="color: #6b7280; font-size: 12px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>
  `;
  
  const text = `Dear ${userName}, You requested a password reset. Click here to reset: ${resetUrl}`;

  await sendEmail({ to: email, subject, html, text });
}

// Helper functions
function getCheckTypeLabel(checkType?: string): string {
  const labels: Record<string, string> = {
    'check_in': 'checked in',
    'check_out': 'checked out',
    'bus_pickup_home': 'been picked up from home',
    'bus_drop_school': 'arrived at school via bus',
    'bus_pickup_school': 'been picked up from school',
    'bus_drop_home': 'arrived home via bus',
  };
  return labels[checkType || ''] || 'checked in';
}

function getBusStatusLabel(checkType?: string): string {
  const labels: Record<string, string> = {
    'bus_pickup_home': 'on the bus to school',
    'bus_drop_school': 'at school',
    'bus_pickup_school': 'on the bus home',
    'bus_drop_home': 'home',
  };
  return labels[checkType || ''] || 'on the bus';
}
