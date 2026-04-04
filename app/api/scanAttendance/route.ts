export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { attendanceService } from '@/services/attendance-service';
import { scanAttendanceSchema } from '@/lib/validation';
import { parseBody, unauthorized, badRequest, success, tooManyRequests, notFound, serverError } from '@/lib/api-response';
import { checkRateLimitRailway } from '@/lib/railway-redis';

const DEVICE_AUTH_HEADER = 'x-device-token';

export async function POST(request: Request) {
  try {
    // Rate limiting: 1000 scans per minute per device
    const deviceId = request.headers.get('x-device-id') || 'unknown';
    const rateLimit = await checkRateLimitRailway(
      `scan:${deviceId}`,
      1000,
      60
    );
    
    if (!rateLimit.allowed) {
      return tooManyRequests('Rate limit exceeded', Math.ceil((rateLimit.reset - Date.now()) / 1000));
    }

    const authHeader = request.headers.get(DEVICE_AUTH_HEADER);
    
    if (!authHeader) {
      return unauthorized('Device token required');
    }

    const body = await request.json();
    const parsed = parseBody(scanAttendanceSchema, body);
    
    if (!parsed.success) {
      return parsed.error;
    }

    const { device_id, rfid_uid, org_id, battery_level } = parsed.data;

    const deviceAuth = await attendanceService.validateDeviceToken(device_id, authHeader);
    
    if (!deviceAuth.valid) {
      return unauthorized(deviceAuth.error || 'Invalid device');
    }

    if (deviceAuth.orgId !== org_id) {
      return badRequest('Device does not belong to this organization');
    }

    const result = await attendanceService.scan(rfid_uid, device_id, org_id, battery_level);

    if (!result.success && result.message === 'Student not found') {
      return notFound('Student');
    }

    if (result.duplicate) {
      return success({
        status: 'success',
        message: result.message,
        duplicate: true,
      });
    }

    return success({
      status: 'success',
      student_name: result.studentName,
      check_type: result.checkType,
      record_id: result.recordId,
      message: result.message,
    });

  } catch (error) {
    console.error('[Scan Attendance Error]', error);
    return serverError();
  }
}

export async function GET() {
  return badRequest('Method not allowed');
}
