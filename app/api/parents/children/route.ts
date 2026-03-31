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
    
    if (!session?.user?.email) {
      return forbidden('Authentication required');
    }

    const userEmail = session.user.email;
    const orgId = session.user.orgId;

    // Find students associated with this parent's email
    // If parent has orgId, filter by it; otherwise search all orgs
    const whereClause: any = {
      guardianEmail: userEmail
    };
    
    if (orgId) {
      whereClause.orgId = orgId;
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        classroom: {
          select: {
            name: true,
            grade: true
          }
        }
      }
    });

    if (students.length === 0) {
      return success({ children: [], attendance: [] });
    }

    const studentIds = students.map(s => s.id);
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    // Get today's attendance for these students
    const attendanceWhere: any = {
      studentId: { in: studentIds },
      scanTime: {
        gte: dayStart,
        lte: dayEnd
      }
    };
    
    if (orgId) {
      attendanceWhere.orgId = orgId;
    }

    const attendance = await prisma.attendanceRecord.findMany({
      where: attendanceWhere,
      orderBy: { scanTime: 'desc' }
    });

    // Format children data
    const children = students.map(student => ({
      id: student.id,
      name: student.name,
      grade: student.classroom?.name || student.grade || 'N/A',
      avatar: student.imageUrl
    }));

    // Format attendance data
    const formattedAttendance = attendance.map(record => ({
      id: record.id,
      childId: record.studentId,
      date: record.scanTime.toISOString().split('T')[0],
      status: record.checkType,
      time: record.scanTime.toISOString()
    }));

    return success({
      children,
      attendance: formattedAttendance
    });
  } catch (error) {
    console.error('[Parents Children API Error]', error);
    return serverError('Failed to fetch children data');
  }
}
