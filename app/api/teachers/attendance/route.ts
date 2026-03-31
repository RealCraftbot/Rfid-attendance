export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    let dateRange = {
      start: startOfDay(new Date()),
      end: endOfDay(new Date())
    };

    switch (period) {
      case 'week':
        dateRange = {
          start: startOfWeek(new Date()),
          end: endOfWeek(new Date())
        };
        break;
      case 'month':
        dateRange = {
          start: startOfMonth(new Date()),
          end: endOfMonth(new Date())
        };
        break;
      default:
        dateRange = {
          start: startOfDay(new Date()),
          end: endOfDay(new Date())
        };
    }

    const records = await prisma.teacherAttendance.findMany({
      where: {
        orgId,
        scanTime: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      orderBy: { scanTime: 'desc' }
    });

    const formattedRecords = records.map(record => ({
      id: record.id,
      teacherId: record.teacherId,
      teacherName: record.teacherName,
      classroomId: record.classroomId,
      checkType: record.checkType,
      scanTime: record.scanTime.toISOString()
    }));

    return success(formattedRecords);
  } catch (error) {
    console.error('[Teacher Attendance API Error]', error);
    return serverError('Failed to fetch teacher attendance');
  }
}
