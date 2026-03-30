export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    // Get total students count
    const totalStudents = await prisma.student.count({
      where: { orgId, isActive: true }
    });

    // Get today's attendance
    const todayAttendance = await prisma.attendanceRecord.findMany({
      where: {
        orgId,
        scanTime: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      include: {
        student: {
          select: {
            name: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        scanTime: 'desc'
      },
      take: 10
    });

    // Count present today (unique students who checked in)
    const presentStudentIds = new Set(
      todayAttendance
        .filter(a => a.checkType === 'check_in')
        .map(a => a.studentId)
    );
    const presentToday = presentStudentIds.size;
    const absentToday = totalStudents - presentToday;
    const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

    // Format recent records
    const recentRecords = todayAttendance.map(record => ({
      id: record.id,
      studentName: record.student?.name || 'Unknown',
      studentImageUrl: record.student?.imageUrl,
      checkType: record.checkType,
      scanTime: record.scanTime.toISOString(),
      deviceId: record.deviceId
    }));

    return success({
      totalStudents,
      presentToday,
      absentToday,
      attendanceRate,
      recentRecords
    });
  } catch (error) {
    console.error('[Dashboard API Error]', error);
    return serverError('Failed to fetch dashboard data');
  }
}