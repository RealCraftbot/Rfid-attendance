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

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return forbidden('Teacher access required');
    }

    const orgId = session.user.orgId;
    const teacherId = session.user.id;
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    // Get classrooms assigned to this teacher
    const assignedClassrooms = await prisma.classroom.findMany({
      where: {
        orgId,
        teacherId
      },
      include: {
        _count: {
          select: {
            students: true
          }
        }
      }
    });

    // Get all student IDs from assigned classrooms
    const classroomIds = assignedClassrooms.map(c => c.id);
    
    // Get students in these classrooms
    const students = await prisma.student.findMany({
      where: {
        orgId,
        classroomId: {
          in: classroomIds
        }
      },
      select: {
        id: true
      }
    });

    const studentIds = students.map(s => s.id);
    const totalStudents = students.length;

    // Get today's attendance for these students
    const todayAttendance = await prisma.attendanceRecord.findMany({
      where: {
        orgId,
        studentId: {
          in: studentIds
        },
        scanTime: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      include: {
        student: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        scanTime: 'desc'
      },
      take: 10
    });

    // Count present students (unique check-ins)
    const presentStudentIds = new Set(
      todayAttendance
        .filter(a => a.checkType === 'check_in')
        .map(a => a.studentId)
    );
    
    const presentToday = presentStudentIds.size;
    const absentToday = totalStudents - presentToday;
    const attendanceRate = totalStudents > 0 
      ? Math.round((presentToday / totalStudents) * 100) 
      : 0;

    // Format recent activity
    const recentActivity = todayAttendance.map(record => ({
      id: record.id,
      studentName: record.student?.name || 'Unknown',
      scanTime: record.scanTime.toISOString(),
      checkType: record.checkType
    }));

    // Format classroom data
    const formattedClassrooms = assignedClassrooms.map(classroom => ({
      id: classroom.id,
      name: classroom.name,
      grade: classroom.grade,
      studentCount: classroom._count.students
    }));

    return success({
      assignedClassrooms: formattedClassrooms,
      totalStudents,
      presentToday,
      absentToday,
      attendanceRate,
      recentActivity
    });
  } catch (error) {
    console.error('[Teacher Dashboard API Error]', error);
    return serverError('Failed to fetch teacher dashboard data');
  }
}