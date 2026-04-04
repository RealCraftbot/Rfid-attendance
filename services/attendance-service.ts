import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

type CheckType = 'check_in' | 'check_out' | 'bus_pickup_home' | 'bus_drop_school' | 'bus_pickup_school' | 'bus_drop_home';
type BusStatus = 'WAITING' | 'ON_BUS_TO_SCHOOL' | 'AT_SCHOOL' | 'ON_BUS_TO_HOME' | 'HOME';

const IDEMPOTENCY_WINDOW_MS = 5000;

export interface ScanResult {
  success: boolean;
  studentName: string;
  checkType: CheckType;
  recordId: string;
  duplicate: boolean;
  message: string;
  busStatus?: BusStatus;
}

export interface DeviceAuthResult {
  valid: boolean;
  deviceId: string;
  orgId: string;
  locationType?: string;
  error?: string;
}

function getNextBusStatus(currentStatus: BusStatus | null, locationType: string): BusStatus {
  const statusMap: Record<string, BusStatus> = {
    home_pickup: 'WAITING',
    school_drop: 'AT_SCHOOL',
    school_pickup: 'ON_BUS_TO_HOME',
    home_drop: 'HOME',
  };
  return statusMap[locationType] || 'WAITING';
}

function determineCheckType(locationType: string): CheckType {
  const checkTypeMap: Record<string, CheckType> = {
    home_pickup: 'bus_pickup_home',
    school_drop: 'bus_drop_school',
    school_pickup: 'bus_pickup_school',
    home_drop: 'bus_drop_home',
  };
  return checkTypeMap[locationType] || 'check_in';
}

export class AttendanceService {
  /**
   * Hash a device token using bcrypt
   * Use this when creating or updating device tokens
   */
  async hashDeviceToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  /**
   * Validate device token using secure comparison
   * Compares provided token with hashed token in database
   */
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

    // Check if token is stored as hash (new format) or plain text (legacy)
    // Legacy tokens are exactly 32 characters (CUID format)
    const isLegacyToken = device.secretKey.length <= 32;
    
    let isValid = false;
    
    if (isLegacyToken) {
      // Legacy plain text comparison (will be migrated)
      isValid = device.secretKey === token;
      
      // Auto-migrate to hashed token on successful validation
      if (isValid) {
        try {
          const hashedToken = await this.hashDeviceToken(token);
          await prisma.device.update({
            where: { id: device.id },
            data: { secretKey: hashedToken },
          });
          console.log(`[SECURITY] Migrated device ${deviceId} to hashed token`);
        } catch (error) {
          console.error(`[SECURITY] Failed to migrate token for device ${deviceId}:`, error);
          // Continue anyway - authentication succeeded
        }
      }
    } else {
      // Modern hashed token comparison
      isValid = await bcrypt.compare(token, device.secretKey);
    }

    if (!isValid) {
      return { valid: false, deviceId, orgId: device.orgId, error: 'Invalid device token' };
    }

    return { 
      valid: true, 
      deviceId: device.id, 
      orgId: device.orgId,
      locationType: device.locationType || 'gate'
    };
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
      include: {
        busRoute: true,
      },
    });
  }

  async getLastAttendance(studentId: string) {
    return prisma.attendanceRecord.findFirst({
      where: { studentId },
      orderBy: { scanTime: 'desc' },
    });
  }

  async scan(
    rfidUid: string,
    deviceId: string,
    orgId: string,
    batteryLevel?: number,
    locationType?: string
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
        checkType: (lastAttendance?.checkType as CheckType) || 'check_in',
        recordId: '',
        duplicate: true,
        message: 'Duplicate scan ignored',
      };
    }

    let newCheckType: CheckType = 'check_in';
    let newBusStatus: BusStatus | undefined;

    if (locationType && student.usesSchoolBus) {
      newCheckType = determineCheckType(locationType);
      newBusStatus = getNextBusStatus(student.busStatus as BusStatus | null, locationType);
    } else {
      const lastAttendance = await this.getLastAttendance(student.id);
      newCheckType = lastAttendance?.checkType === 'check_in' ? 'check_out' : 'check_in';
    }

    const device = await prisma.device.findFirst({
      where: { deviceId },
    });

    // Create attendance record
    const attendance = await prisma.attendanceRecord.create({
      data: {
        studentId: student.id,
        studentName: student.name,
        orgId,
        deviceId: device?.id || deviceId,
        checkType: newCheckType,
        scanTime: new Date(),
        busRouteId: student.busRouteId || undefined,
      },
    });

    // Update student bus status if applicable
    if (newBusStatus && student.usesSchoolBus) {
      await prisma.student.update({
        where: { id: student.id },
        data: { busStatus: newBusStatus },
      });
    }

    // Update device battery level if provided
    if (batteryLevel !== undefined && device) {
      await prisma.device.update({
        where: { id: device.id },
        data: { 
          batteryLevel,
          lastSeen: new Date(),
        },
      });
    }

    return {
      success: true,
      studentName: student.name,
      checkType: newCheckType,
      recordId: attendance.id,
      duplicate: false,
      message: `Successfully recorded ${newCheckType.replace('_', ' ')}`,
      busStatus: newBusStatus,
    };
  }
}

export const attendanceService = new AttendanceService();
