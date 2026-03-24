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

  /**
   * Get grouped attendance records for a specific date
   * Groups multiple scans per student into single daily records
   * Earliest scan = check_in, Latest scan = check_out
   */
  async getGroupedAttendance(
    orgId: string,
    date: Date,
    searchQuery?: string,
    statusFilter?: 'all' | 'present' | 'absent' | 'late'
  ) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all attendance records for the date with orgId filter
    const records = await prisma.attendanceRecord.findMany({
      where: {
        orgId,
        scanTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(searchQuery && {
          student: {
            name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        }),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            classroom: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        scanTime: 'asc',
      },
    });

    // Get all active students for the org (to identify absences)
    const allStudents = await prisma.student.findMany({
      where: {
        orgId,
        isActive: true,
        ...(searchQuery && {
          name: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        }),
      },
      select: {
        id: true,
        name: true,
        classroom: {
          select: {
            name: true,
          },
        },
      },
    });

    // Group records by student
    const groupedByStudent = new Map<string, typeof records>();
    records.forEach((record: typeof records[0]) => {
      const studentId = record.studentId;
      if (!groupedByStudent.has(studentId)) {
        groupedByStudent.set(studentId, []);
      }
      groupedByStudent.get(studentId)?.push(record);
    });

    // Build grouped attendance data
    const groupedAttendance = allStudents.map((student: typeof allStudents[0]) => {
      const studentRecords = groupedByStudent.get(student.id) || [];
      const checkInRecord = studentRecords.find((r: typeof records[0]) => r.checkType === 'check_in');
      const checkOutRecord = [...studentRecords].reverse().find((r: typeof records[0]) => r.checkType === 'check_out');

      let durationOnSite: number | null = null;
      if (checkInRecord?.scanTime && checkOutRecord?.scanTime) {
        durationOnSite = Math.round(
          (new Date(checkOutRecord.scanTime).getTime() - new Date(checkInRecord.scanTime).getTime()) / (1000 * 60)
        );
      }

      // Determine status
      let status: 'present' | 'absent' | 'late' | 'on-site' | 'checked-out';
      if (studentRecords.length === 0) {
        status = 'absent';
      } else if (checkInRecord && !checkOutRecord) {
        status = 'on-site';
      } else if (checkInRecord && checkOutRecord) {
        status = 'checked-out';
      } else {
        status = 'present';
      }

      // Check for late arrival (after 8:00 AM)
      const isLate = checkInRecord && new Date(checkInRecord.scanTime).getHours() >= 8 && new Date(checkInRecord.scanTime).getMinutes() > 0;
      if (isLate && status !== 'absent') {
        status = 'late';
      }

      return {
        studentId: student.id,
        studentName: student.name,
        className: student.classroom?.name || 'N/A',
        status,
        checkInTime: checkInRecord?.scanTime || null,
        checkOutTime: checkOutRecord?.scanTime || null,
        deviceId: checkInRecord?.deviceId || checkOutRecord?.deviceId || null,
        durationOnSite,
        totalScans: studentRecords.length,
      };
    });

    // Apply status filter
    let filteredAttendance = groupedAttendance;
    if (statusFilter && statusFilter !== 'all') {
      filteredAttendance = groupedAttendance.filter((a: typeof groupedAttendance[0]) => {
        if (statusFilter === 'present') return a.status === 'present' || a.status === 'on-site' || a.status === 'checked-out';
        if (statusFilter === 'absent') return a.status === 'absent';
        if (statusFilter === 'late') return a.status === 'late';
        return true;
      });
    }

    // Calculate summary stats
    const stats = {
      total: allStudents.length,
      present: filteredAttendance.filter((a: typeof groupedAttendance[0]) => a.status !== 'absent').length,
      absent: filteredAttendance.filter((a: typeof groupedAttendance[0]) => a.status === 'absent').length,
      late: filteredAttendance.filter((a: typeof groupedAttendance[0]) => a.status === 'late').length,
      onSite: filteredAttendance.filter((a: typeof groupedAttendance[0]) => a.status === 'on-site').length,
      checkedOut: filteredAttendance.filter((a: typeof groupedAttendance[0]) => a.status === 'checked-out').length,
    };

    return {
      attendance: filteredAttendance,
      stats,
      date,
    };
  }

  /**
   * Get attendance records filtered by classroom
   */
  async getAttendanceByClassroom(
    orgId: string,
    classroomId: string,
    date: Date,
    searchQuery?: string
  ) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get students in this classroom
    const students = await prisma.student.findMany({
      where: {
        orgId,
        classroomId,
        isActive: true,
        ...(searchQuery && {
          name: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        }),
      },
      select: {
        id: true,
        name: true,
        rfidUid: true,
      },
    });

    // Get attendance records for these students
    const records = await prisma.attendanceRecord.findMany({
      where: {
        orgId,
        studentId: { in: students.map((s: { id: string }) => s.id) },
        scanTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        scanTime: 'asc',
      },
    });

    // Group by student
    const groupedByStudent = new Map<string, typeof records>();
    records.forEach((record: typeof records[0]) => {
      const studentId = record.studentId;
      if (!groupedByStudent.has(studentId)) {
        groupedByStudent.set(studentId, []);
      }
      groupedByStudent.get(studentId)?.push(record);
    });

    // Build attendance data
    const attendance = students.map((student: typeof students[0]) => {
      const studentRecords = groupedByStudent.get(student.id) || [];
      const checkInRecord = studentRecords.find((r: typeof records[0]) => r.checkType === 'check_in');
      const checkOutRecord = [...studentRecords].reverse().find((r: typeof records[0]) => r.checkType === 'check_out');

      let durationOnSite: number | null = null;
      if (checkInRecord?.scanTime && checkOutRecord?.scanTime) {
        durationOnSite = Math.round(
          (new Date(checkOutRecord.scanTime).getTime() - new Date(checkInRecord.scanTime).getTime()) / (1000 * 60)
        );
      }

      let status: 'present' | 'absent' | 'late' | 'on-site' | 'checked-out';
      if (studentRecords.length === 0) {
        status = 'absent';
      } else if (checkInRecord && !checkOutRecord) {
        status = 'on-site';
      } else if (checkInRecord && checkOutRecord) {
        status = 'checked-out';
      } else {
        status = 'present';
      }

      return {
        studentId: student.id,
        studentName: student.name,
        status,
        checkInTime: checkInRecord?.scanTime || null,
        checkOutTime: checkOutRecord?.scanTime || null,
        deviceId: checkInRecord?.deviceId || checkOutRecord?.deviceId || null,
        durationOnSite,
        totalScans: studentRecords.length,
      };
    });

    const stats = {
      total: students.length,
      present: attendance.filter((a: typeof attendance[0]) => a.status !== 'absent').length,
      absent: attendance.filter((a: typeof attendance[0]) => a.status === 'absent').length,
      onSite: attendance.filter((a: typeof attendance[0]) => a.status === 'on-site').length,
      checkedOut: attendance.filter((a: typeof attendance[0]) => a.status === 'checked-out').length,
    };

    return {
      attendance,
      stats,
      classroom: await prisma.classroom.findUnique({
        where: { id: classroomId },
        select: { name: true, grade: true },
      }),
    };
  }

  /**
   * Teacher RFID scan for classroom attendance
   */
  async scanTeacher(
    rfidUid: string,
    deviceId: string,
    orgId: string,
    classroomId: string,
    batteryLevel?: number
  ) {
    // Find teacher by RFID (stored in User model for teachers)
    const teacher = await prisma.user.findFirst({
      where: {
        orgId,
        role: 'TEACHER',
        // In real implementation, would need to link RFID to teacher
        // For now, we'll search by a custom field or use the teacher's ID
      },
    });

    if (!teacher) {
      return {
        success: false,
        teacherName: '',
        checkType: 'check_in',
        recordId: '',
        message: 'Teacher not found or not assigned to this organization',
      };
    }

    // Check classroom exists
    const classroom = await prisma.classroom.findFirst({
      where: { id: classroomId, orgId },
    });

    if (!classroom) {
      return {
        success: false,
        teacherName: teacher.name,
        checkType: 'check_in',
        recordId: '',
        message: 'Classroom not found',
      };
    }

    // Check for recent scan (idempotency)
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const recentScan = await prisma.teacherAttendance.findFirst({
      where: {
        teacherId: teacher.id,
        classroomId,
        scanTime: { gte: fiveSecondsAgo },
      },
    });

    if (recentScan) {
      return {
        success: true,
        teacherName: teacher.name,
        checkType: recentScan.checkType,
        recordId: '',
        message: 'Duplicate scan ignored',
      };
    }

    // Determine check type based on last scan
    const lastScan = await prisma.teacherAttendance.findFirst({
      where: {
        teacherId: teacher.id,
        classroomId,
      },
      orderBy: { scanTime: 'desc' },
    });

    const checkType = lastScan?.checkType === 'check_in' ? 'check_out' : 'check_in';

    // Create attendance record
    const record = await prisma.teacherAttendance.create({
      data: {
        teacherId: teacher.id,
        teacherName: teacher.name,
        classroomId,
        orgId,
        deviceId,
        checkType,
      },
    });

    // Update device last seen
    await prisma.device.updateMany({
      where: { deviceId, orgId },
      data: {
        lastSeen: new Date(),
        ...(batteryLevel !== undefined && { batteryLevel }),
      },
    });

    return {
      success: true,
      teacherName: teacher.name,
      checkType,
      recordId: record.id,
      classroomName: classroom.name,
      message: `${teacher.name} has ${checkType === 'check_in' ? 'checked in to' : 'checked out from'} ${classroom.name}`,
    };
  }

  /**
   * Get teacher attendance history
   */
  async getTeacherAttendance(
    orgId: string,
    teacherId?: string,
    classroomId?: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: any = { orgId };

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (classroomId) {
      where.classroomId = classroomId;
    }

    if (startDate && endDate) {
      where.scanTime = {
        gte: startDate,
        lte: endDate,
      };
    }

    const records = await prisma.teacherAttendance.findMany({
      where,
      include: {
        classroom: {
          select: {
            name: true,
            grade: true,
          },
        },
      },
      orderBy: { scanTime: 'desc' },
      take: 100,
    });

    // Group by date for better visualization
    const groupedByDate = new Map<string, typeof records>();
    records.forEach((record: typeof records[0]) => {
      const date = new Date(record.scanTime).toDateString();
      if (!groupedByDate.has(date)) {
        groupedByDate.set(date, []);
      }
      groupedByDate.get(date)?.push(record);
    });

    return {
      records,
      groupedByDate: Array.from(groupedByDate.entries()).map(([date, recs]) => ({
        date,
        records: recs,
      })),
    };
  }
}

export const attendanceService = new AttendanceService();
