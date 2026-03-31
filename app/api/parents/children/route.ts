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
    const userId = session.user.id;

    // Find students associated with this parent's user ID
    // This assumes students have guardianEmail or guardianPhone matching parent's contact
    const students = await prisma.student.findMany({
      where: { 
        orgId,
        guardianEmail: session.user.email
      },
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
    const attendance = await prisma.attendanceRecord.findMany({
      where: {
        studentId: { in: studentIds },
        scanTime: {
          gte: dayStart,
          lte: dayEnd
        }
      },
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
