export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const { classroomId } = await params;
    const orgId = session.user.orgId;
    
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Get classroom info
    const classroom = await prisma.classroom.findFirst({
      where: { id: classroomId, orgId },
      include: {
        students: {
          where: { isActive: true },
          select: { 
            id: true,
            name: true,
            imageUrl: true
          }
        }
      }
    });

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: 'Classroom not found' },
        { status: 404 }
      );
    }

    // Get all attendance records for this classroom's students on the given date
    const studentIds = classroom.students.map(s => s.id);
    
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        studentId: { in: studentIds },
        orgId,
        scanTime: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      orderBy: { scanTime: 'asc' }
    });

    // Group records by student
    const studentRecords: Record<string, typeof attendanceRecords> = {};
    attendanceRecords.forEach(record => {
      if (!studentRecords[record.studentId]) {
        studentRecords[record.studentId] = [];
      }
      studentRecords[record.studentId].push(record);
    });

    // Build attendance data for each student
    const records = classroom.students.map(student => {
      const scans = studentRecords[student.id] || [];
      const checkInScan = scans.find(s => s.checkType === 'check_in');
      const checkOutScan = scans.find(s => s.checkType === 'check_out');
      
      let status: 'present' | 'absent' | 'on-site' | 'checked-out' = 'absent';
      
      if (checkInScan && checkOutScan) {
        status = 'checked-out';
      } else if (checkInScan) {
        status = 'present';
      } else if (scans.length > 0) {
        status = 'on-site';
      }

      // Calculate duration on site
      let durationOnSite: number | null = null;
      if (checkInScan) {
        const endTime = checkOutScan ? checkOutScan.scanTime : new Date();
        durationOnSite = Math.round((endTime.getTime() - checkInScan.scanTime.getTime()) / 60000);
      }

      return {
        studentId: student.id,
        studentName: student.name,
        studentImageUrl: student.imageUrl,
        status,
        checkInTime: checkInScan ? checkInScan.scanTime.toISOString() : null,
        checkOutTime: checkOutScan ? checkOutScan.scanTime.toISOString() : null,
        deviceId: checkInScan?.deviceId || null,
        durationOnSite,
        totalScans: scans.length
      };
    });

    // Calculate stats
    const stats = {
      total: classroom.students.length,
      present: records.filter(r => r.status === 'present' || r.status === 'checked-out').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: 0,
      onSite: records.filter(r => r.status === 'on-site').length,
      checkedOut: records.filter(r => r.status === 'checked-out').length
    };

    return success({
      classroom: {
        id: classroom.id,
        name: classroom.name,
        grade: classroom.grade,
        section: classroom.grade,
        teacherName: null,
        studentCount: classroom.students.length
      },
      records,
      stats
    });
  } catch (error) {
    console.error('[Classroom Attendance API Error]', error);
    return serverError('Failed to fetch classroom attendance');
  }
}
