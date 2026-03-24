import { prisma } from '@/lib/prisma';

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

    return prisma.$transaction(async (tx: any) => {
      const record = await tx.attendanceRecord.create({
        data: {
          studentId: student.id,
          studentName: student.name,
          orgId,
          deviceId,
          checkType: newCheckType,
          busRouteId: student.busRouteId || undefined,
        },
      });

      const updateData: any = {
        currentStatus: newCheckType,
        lastSeen: new Date(),
      };

      if (newBusStatus) {
        updateData.busStatus = newBusStatus;
      }

      await tx.student.update({
        where: { id: student.id },
        data: updateData,
      });

      await tx.device.update({
        where: { id: device.id },
        data: {
          lastSeen: new Date(),
          ...(batteryLevel !== undefined && { batteryLevel }),
        },
      });

      const actionMessages: Record<CheckType, string> = {
        check_in: 'checked in',
        check_out: 'checked out',
        bus_pickup_home: 'picked up from home',
        bus_drop_school: 'dropped at school',
        bus_pickup_school: 'picked up from school',
        bus_drop_home: 'dropped at home',
      };

      return {
        success: true,
        studentName: student.name,
        checkType: newCheckType,
        recordId: record.id,
        duplicate: false,
        busStatus: newBusStatus,
        message: `${student.name} has ${actionMessages[newCheckType]}`,
      };
    });
  }

  async getAttendanceStats(orgId: string, startDate: Date, endDate: Date) {
    const [totalStudents, checkedIn, busStudents, records] = await Promise.all([
      prisma.student.count({ where: { orgId, isActive: true } }),
      prisma.student.count({ where: { orgId, isActive: true, currentStatus: 'check_in' } }),
      prisma.student.count({ where: { orgId, isActive: true, usesSchoolBus: true } }),
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
      busStudents,
      absent: 0,
      attendanceRate: totalStudents > 0 ? Math.round((checkedIn / totalStudents) * 100) : 0,
      recentRecords: records,
    };
  }

  async getBusStats(orgId: string) {
    const busStatusFilter = (status: string) => ({ orgId, usesSchoolBus: true, isActive: true, busStatus: status as any });

    const [totalBusStudents, waitingHome, onBusToSchool, atSchool, onBusToHome, home] = await Promise.all([
      prisma.student.count({ where: { orgId, usesSchoolBus: true, isActive: true } }),
      prisma.student.count({ where: busStatusFilter('WAITING') }),
      prisma.student.count({ where: busStatusFilter('ON_BUS_TO_SCHOOL') }),
      prisma.student.count({ where: busStatusFilter('AT_SCHOOL') }),
      prisma.student.count({ where: busStatusFilter('ON_BUS_TO_HOME') }),
      prisma.student.count({ where: busStatusFilter('HOME') }),
    ]);

    return {
      totalBusStudents,
      waitingHome,
      onBusToSchool,
      atSchool,
      onBusToHome,
      home,
    };
  }
}

export const attendanceService = new AttendanceService();
