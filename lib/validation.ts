import { z } from 'zod';

export const scanAttendanceSchema = z.object({
  device_id: z.string().min(1, 'Device ID is required'),
  rfid_uid: z.string().min(1, 'RFID UID is required'),
  org_id: z.string().min(1, 'Organization ID is required'),
  battery_level: z.number().int().min(0).max(100).optional(),
  timestamp: z.string().datetime().optional(),
}).strict();

export const deviceAuthSchema = z.object({
  'x-device-token': z.string().min(1, 'Device token required'),
}).strict();

export const idSchema = z.string().cuid();

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const attendanceQuerySchema = z.object({
  orgId: z.string().cuid(),
  studentId: z.string().cuid().optional(),
  deviceId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
}).strict();

export type ScanAttendanceInput = z.infer<typeof scanAttendanceSchema>;
export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
