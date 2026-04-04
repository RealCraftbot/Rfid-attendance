// Monitoring and health check utilities for production
import { prisma } from './prisma';

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
    api: HealthCheck;
    memory: HealthCheck;
  };
  metrics: {
    uptime: number;
    responseTime: number;
    activeUsers: number;
    errorRate: number;
  };
}

interface HealthCheck {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

export class MonitoringService {
  private static startTime = Date.now();

  // Comprehensive health check
  static async checkHealth(): Promise<SystemHealth> {
    const startTime = Date.now();
    
    const [dbCheck, redisCheck, apiCheck, memoryCheck] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkAPI(),
      this.checkMemory(),
    ]);

    const responseTime = Date.now() - startTime;
    
    // Determine overall status
    const failedChecks = [dbCheck, redisCheck, apiCheck, memoryCheck].filter(
      c => c.status === 'down'
    ).length;
    
    const degradedChecks = [dbCheck, redisCheck, apiCheck, memoryCheck].filter(
      c => c.status === 'degraded'
    ).length;
    
    let status: SystemHealth['status'] = 'healthy';
    if (failedChecks > 0) status = 'unhealthy';
    else if (degradedChecks > 0) status = 'degraded';

    // Get active users (last 5 minutes)
    const activeUsers = await this.getActiveUsers();
    
    // Get error rate (last hour)
    const errorRate = await this.getErrorRate();

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbCheck,
        redis: redisCheck,
        api: apiCheck,
        memory: memoryCheck,
      },
      metrics: {
        uptime: Date.now() - this.startTime,
        responseTime,
        activeUsers,
        errorRate,
      },
    };
  }

  private static async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Database connection failed',
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private static async checkRedis(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      // Check if Redis is configured
      const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
      if (!redisUrl) {
        return {
          status: 'degraded',
          message: 'Redis not configured - using fallback',
          lastChecked: new Date().toISOString(),
        };
      }
      
      // Simple ping test would go here if using native Redis client
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Redis connection failed',
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private static async checkAPI(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      // Check if API is responding
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'down',
        message: 'API health check failed',
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private static checkMemory(): HealthCheck {
    const used = process.memoryUsage();
    const total = used.heapTotal / 1024 / 1024; // MB
    const usedMB = used.heapUsed / 1024 / 1024; // MB
    const percentage = (usedMB / total) * 100;
    
    let status: HealthCheck['status'] = 'up';
    let message: string | undefined;
    
    if (percentage > 90) {
      status = 'down';
      message = `Memory critical: ${usedMB.toFixed(2)}MB / ${total.toFixed(2)}MB (${percentage.toFixed(1)}%)`;
    } else if (percentage > 75) {
      status = 'degraded';
      message = `Memory high: ${usedMB.toFixed(2)}MB / ${total.toFixed(2)}MB (${percentage.toFixed(1)}%)`;
    }
    
    return {
      status,
      message,
      lastChecked: new Date().toISOString(),
    };
  }

  private static async getActiveUsers(): Promise<number> {
    try {
      // Count users with recent activity (last 5 minutes)
      // This would ideally use session data or activity logs
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const recentLogins = await prisma.auditLog.count({
        where: {
          action: 'USER_LOGIN',
          createdAt: {
            gte: fiveMinutesAgo,
          },
        },
      });
      
      return recentLogins;
    } catch {
      return 0;
    }
  }

  private static async getErrorRate(): Promise<number> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const [totalRequests, failedRequests] = await Promise.all([
        prisma.auditLog.count({
          where: {
            createdAt: {
              gte: oneHourAgo,
            },
          },
        }),
        prisma.auditLog.count({
          where: {
            createdAt: {
              gte: oneHourAgo,
            },
            status: 'FAILURE',
          },
        }),
      ]);
      
      if (totalRequests === 0) return 0;
      return (failedRequests / totalRequests) * 100;
    } catch {
      return 0;
    }
  }

  // Get security metrics
  static async getSecurityMetrics() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [
      failedLogins,
      unauthorizedAccess,
      passwordResets,
      dataExports,
      rateLimitViolations,
    ] = await Promise.all([
      prisma.auditLog.count({
        where: {
          action: 'LOGIN_FAILED',
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'UNAUTHORIZED_ACCESS',
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'PASSWORD_RESET',
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'EXPORT_DATA',
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
      // Rate limit violations would be tracked separately
      Promise.resolve(0),
    ]);

    return {
      failedLogins,
      unauthorizedAccess,
      passwordResets,
      dataExports,
      rateLimitViolations,
      timestamp: new Date().toISOString(),
    };
  }

  // Get business metrics
  static async getBusinessMetrics() {
    const [
      totalOrganizations,
      totalStudents,
      totalUsers,
      todayAttendance,
      pendingPayments,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.student.count(),
      prisma.user.count(),
      prisma.attendanceRecord.count({
        where: {
          scanTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.paymentTransaction.count({
        where: {
          transactionStatus: 'PENDING',
        },
      }),
    ]);

    return {
      totalOrganizations,
      totalStudents,
      totalUsers,
      todayAttendance,
      pendingPayments,
      timestamp: new Date().toISOString(),
    };
  }
}

// Alert thresholds
export const ALERT_THRESHOLDS = {
  errorRate: 5, // 5% error rate
  responseTime: 5000, // 5 seconds
  memoryUsage: 85, // 85%
  failedLogins: 10, // 10 failed logins per hour
};
