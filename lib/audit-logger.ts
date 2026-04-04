// Audit logging system for compliance and security
import { prisma } from './prisma';

export type AuditAction = 
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'STUDENT_CREATE'
  | 'STUDENT_UPDATE'
  | 'STUDENT_DELETE'
  | 'ATTENDANCE_SCAN'
  | 'PAYMENT_CREATE'
  | 'PAYMENT_APPROVE'
  | 'PAYMENT_REJECT'
  | 'FEE_STRUCTURE_CREATE'
  | 'FEE_STRUCTURE_UPDATE'
  | 'DEVICE_CREATE'
  | 'DEVICE_UPDATE'
  | 'DEVICE_DELETE'
  | 'ORGANIZATION_CREATE'
  | 'ORGANIZATION_UPDATE'
  | 'CLASSROOM_CREATE'
  | 'CLASSROOM_UPDATE'
  | 'SETTINGS_UPDATE'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFICATION'
  | 'INVITE_ACCEPT'
  | 'FILE_UPLOAD'
  | 'FILE_DELETE'
  | 'EXPORT_DATA'
  | 'LOGIN_FAILED'
  | 'UNAUTHORIZED_ACCESS';

export interface AuditLogData {
  action: AuditAction;
  userId?: string;
  orgId?: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
}

export class AuditLogger {
  // Log an audit event
  static async log(data: AuditLogData): Promise<void> {
    try {
      // Store in database
      await prisma.auditLog.create({
        data: {
          action: data.action,
          userId: data.userId,
          orgId: data.orgId,
          targetId: data.targetId,
          targetType: data.targetType,
          details: data.details || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          status: data.status,
          errorMessage: data.errorMessage,
        },
      });

      // Also log to console for immediate visibility
      const statusIcon = data.status === 'SUCCESS' ? '✅' : '❌';
      console.log(`[AUDIT] ${statusIcon} ${data.action} | User: ${data.userId || 'N/A'} | Org: ${data.orgId || 'N/A'} | Target: ${data.targetType || 'N/A'}/${data.targetId || 'N/A'}`);
    } catch (error) {
      // Don't throw - audit logging should never break the app
      console.error('[AUDIT ERROR] Failed to log audit event:', error);
    }
  }

  // Helper methods for common actions
  static async logLogin(
    userId: string,
    orgId: string | null,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      action: success ? 'USER_LOGIN' : 'LOGIN_FAILED',
      userId,
      orgId: orgId || undefined,
      ipAddress,
      userAgent,
      status: success ? 'SUCCESS' : 'FAILURE',
      errorMessage,
    });
  }

  static async logPasswordChange(
    userId: string,
    orgId: string | null,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      action: 'PASSWORD_CHANGE',
      userId,
      orgId: orgId || undefined,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
    });
  }

  static async logDataExport(
    userId: string,
    orgId: string,
    entityType: string,
    ipAddress: string,
    recordCount: number
  ): Promise<void> {
    await this.log({
      action: 'EXPORT_DATA',
      userId,
      orgId,
      targetType: entityType,
      details: { recordCount },
      ipAddress,
      status: 'SUCCESS',
    });
  }

  static async logUnauthorizedAccess(
    userId: string | null,
    orgId: string | null,
    attemptedAction: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      action: 'UNAUTHORIZED_ACCESS',
      userId: userId || undefined,
      orgId: orgId || undefined,
      targetType: attemptedAction,
      ipAddress,
      userAgent,
      status: 'FAILURE',
      errorMessage: 'User attempted unauthorized action',
    });
  }
}

// Helper to extract IP and user agent from request
export function getRequestMetadata(request: Request): { ipAddress: string; userAgent: string } {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ipAddress = forwarded?.split(',')[0].trim() || realIp || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}
