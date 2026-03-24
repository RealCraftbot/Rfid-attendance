export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { success, badRequest, serverError } from '@/lib/api-response';
import { attendanceService } from '@/services/attendance-service';

const teacherScanSchema = z.object({
  device_id: z.string().min(1, 'Device ID is required'),
  rfid_uid: z.string().min(1, 'RFID UID is required'),
  org_id: z.string().min(1, 'Organization ID is required'),
  classroom_id: z.string().min(1, 'Classroom ID is required'),
  battery_level: z.number().int().min(0).max(100).optional(),
}).strict();

/**
 * POST /api/attendance/teacher-scan
 * Handle teacher RFID scan for classroom attendance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = teacherScanSchema.safeParse(body);
    if (!validation.success) {
      return badRequest('Invalid request body', validation.error.issues);
    }

    const { 
      device_id: deviceId, 
      rfid_uid: rfidUid, 
      org_id: orgId, 
      classroom_id: classroomId,
      battery_level: batteryLevel 
    } = validation.data;

    // Process the teacher scan
    const result = await attendanceService.scanTeacher(
      rfidUid,
      deviceId,
      orgId,
      classroomId,
      batteryLevel
    );

    if (!result.success) {
      return badRequest(result.message);
    }

    return success({
      teacherName: result.teacherName,
      checkType: result.checkType,
      recordId: result.recordId,
      classroomName: result.classroomName,
      message: result.message,
    });
  } catch (error) {
    console.error('[Teacher Scan Error]', error);
    return serverError('Failed to process teacher scan');
  }
}

/**
 * GET /api/attendance/teacher-scan
 * Get teacher attendance history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const orgId = searchParams.get('org_id');
    const teacherId = searchParams.get('teacher_id') || undefined;
    const classroomId = searchParams.get('classroom_id') || undefined;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!orgId) {
      return badRequest('Organization ID is required');
    }

    const result = await attendanceService.getTeacherAttendance(
      orgId,
      teacherId,
      classroomId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return success(result);
  } catch (error) {
    console.error('[Get Teacher Attendance Error]', error);
    return serverError('Failed to fetch teacher attendance');
  }
}
