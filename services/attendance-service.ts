import { prisma } from '@/lib/prisma';

type CheckType = 'check_in' | 'check_out';

const IDEMPOTENCY_WINDOW_MS = 5000;

export interface ScanResult {
  success: boolean;
  studentName: string;
  checkType: CheckType;
  recordId: string;
  duplicate: boolean;
  message: string;
}

export interface DeviceAuthResult {
  valid: boolean;
  deviceId: string;
  orgId: string;
  error?: string;
}

export class AttendanceService {
  async validateDeviceToken(deviceId: string, token: string): Promise<DeviceAuthResult> {
    const device = await prisma.device.findFirst({
      where: {
        deviceId,
        isActive: true,
      },
    });

    if (!device) {
      return { valid: false, deviceId, orgId: '', error: 'Device not found or inactive' };
    }

    if (device.secretKey !== token) {
      return { valid: false, deviceId, orgId: device.orgId, error: 'Invalid device token' };
    }

    return { valid: true, deviceId: device.id, orgId: device.orgId };
  }

  async checkIdempotency(rfidUid: string, deviceId: string): Promise<boolean> {
    const fiveSecondsAgo = new Date(Date.now() - IDEMPOTENCY_WINDOW_MS);

    const recentScan = await prisma.attendanceRecord.findFirst({
      where: {
        deviceId,
        student: { rfidUid },
        scanTime: { gte: fiveSecondsAgo },
      },
    });

    return recentScan !== null;
  }

  async findStudent(rfidUid: string, orgId: string) {
    return prisma.student.findFirst({
      where: {
        rfidUid,
        orgId,
        isActive: true,
      },
    });
  }

  async getLastAttendance(studentId: string): Promise<{ checkType: CheckType; scanTime: Date } | null> {
    const last = await prisma.attendanceRecord.findFirst({
      where: { studentId },
      orderBy: { scanTime: 'desc' },
    });
    return last as { checkType: CheckType; scanTime: Date } | null;
  }

  async scan(
    rfidUid: string,
    deviceId: string,
    orgId: string,
    batteryLevel?: number
  ): Promise<ScanResult> {
    const student = await this.findStudent(rfidUid, orgId);

    if (!student) {
      return {
        success: false,
        studentName: '',
        checkType: 'check_in',
        recordId: '',
        duplicate: false,
        message: 'Student not found',
      };
    }

    const isDuplicate = await this.checkIdempotency(rfidUid, deviceId);

    if (isDuplicate) {
      const lastAttendance = await this.getLastAttendance(student.id);
      return {
        success: true,
        studentName: student.name,
        checkType: lastAttendance?.checkType || 'check_in',
        recordId: '',
        duplicate: true,
        message: 'Duplicate scan ignored',
      };
    }

    const lastAttendance = await this.getLastAttendance(student.id);
    const newCheckType: CheckType = lastAttendance?.checkType === 'check_in' ? 'check_out' : 'check_in';

    const device = await prisma.device.findFirst({
      where: { deviceId, orgId, isActive: true },
    });

    if (!device) {
      return {
        success: false,
        studentName: student.name,
        checkType: newCheckType,
        recordId: '',
        duplicate: false,
        message: 'Device not found or inactive',
      };
    }

    return prisma.$transaction(async (tx) => {
      const record = await tx.attendanceRecord.create({
        data: {
          studentId: student.id,
          studentName: student.name,
          orgId,
          deviceId,
          checkType: newCheckType,
        },
      });

      await tx.student.update({
        where: { id: student.id },
        data: {
          currentStatus: newCheckType,
          lastSeen: new Date(),
        },
      });

      await tx.device.update({
        where: { id: device.id },
        data: {
          lastSeen: new Date(),
          ...(batteryLevel !== undefined && { batteryLevel }),
        },
      });

      return {
        success: true,
        studentName: student.name,
        checkType: newCheckType,
        recordId: record.id,
        duplicate: false,
        message: `${student.name} has ${newCheckType === 'check_in' ? 'checked in' : 'checked out'}`,
      };
    });
  }

  async getAttendanceStats(orgId: string, startDate: Date, endDate: Date) {
    const [totalStudents, checkedIn, records] = await Promise.all([
      prisma.student.count({ where: { orgId, isActive: true } }),
      prisma.student.count({ where: { orgId, isActive: true, currentStatus: 'check_in' } }),
      prisma.attendanceRecord.findMany({
        where: {
          orgId,
          scanTime: { gte: startDate, lte: endDate },
        },
        orderBy: { scanTime: 'desc' },
        take: 100,
        include: { student: { select: { name: true, classroom: true } } },
      }),
    ]);

    return {
      totalStudents,
      checkedIn,
      checkedOut: totalStudents - checkedIn,
      absent: 0,
      attendanceRate: totalStudents > 0 ? Math.round((checkedIn / totalStudents) * 100) : 0,
      recentRecords: records,
    };
  }
}

export const attendanceService = new AttendanceService();
