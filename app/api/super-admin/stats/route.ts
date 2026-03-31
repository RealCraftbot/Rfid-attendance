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
    
    if (session?.user?.role !== 'SUPER_ADMIN') {
      return forbidden('Super admin access required');
    }

    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    const [totalOrgs, activeUsers, totalDevices, todayAttendance] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
      prisma.device.count(),
      prisma.attendanceRecord.count({
        where: {
          scanTime: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      })
    ]);

    const stats = [
      { title: 'Total Organizations', value: totalOrgs, change: 12, icon: 'Building2', trend: 'up', color: 'bg-blue-100 text-blue-600' },
      { title: 'Active Users', value: activeUsers, change: 8, icon: 'Users', trend: 'up', color: 'bg-green-100 text-green-600' },
      { title: 'RFID Devices', value: totalDevices, change: 3, icon: 'Cpu', trend: 'up', color: 'bg-purple-100 text-purple-600' },
      { title: 'Attendance Today', value: todayAttendance, change: 5, icon: 'Activity', trend: 'up', color: 'bg-orange-100 text-orange-600' }
    ];

    return success(stats);
  } catch (error) {
    console.error('[Super Admin Stats API Error]', error);
    return serverError('Failed to fetch stats');
  }
}
