export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return forbidden('Authentication required');
    }

    const orgId = session.user.orgId;
    const userId = session.user.id;

    // Get all timetable entries for this teacher
    const timetableEntries = await prisma.timetable.findMany({
      where: {
        teacherId: userId,
        ...(orgId ? { orgId } : {})
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        }
      },
      orderBy: [
        { day: 'asc' },
        { period: 'asc' }
      ]
    });

    // Group by day
    const scheduleByDay: Record<string, any[]> = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    days.forEach(day => {
      scheduleByDay[day] = timetableEntries
        .filter(entry => entry.day === day)
        .map(entry => ({
          id: entry.id,
          day: entry.day,
          period: entry.period,
          periodLabel: entry.periodLabel || `Period ${entry.period}`,
          startTime: entry.startTime,
          endTime: entry.endTime,
          subject: entry.subject,
          classroom: entry.classroom,
          isBreak: entry.isBreak || false
        }));
    });

    // Calculate summary
    const totalHours = timetableEntries.reduce((acc, entry) => {
      if (!entry.isBreak) {
        const [startH, startM] = entry.startTime.split(':').map(Number);
        const [endH, endM] = entry.endTime.split(':').map(Number);
        const minutes = (endH * 60 + endM) - (startH * 60 + startM);
        return acc + minutes;
      }
      return acc;
    }, 0);

    const summary = {
      totalPeriods: timetableEntries.filter(e => !e.isBreak).length,
      totalHours: Math.round(totalHours / 60),
      classesCount: [...new Set(timetableEntries.map(e => e.classroomId))].length,
      subjectsCount: [...new Set(timetableEntries.filter(e => !e.isBreak && e.subject).map(e => e.subject))].length
    };

    return success({
      schedule: scheduleByDay,
      summary,
      entries: timetableEntries
    });
  } catch (error) {
    console.error('[Teacher Schedule API Error]', error);
    return serverError('Failed to fetch teacher schedule');
  }
}
