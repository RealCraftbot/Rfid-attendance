import { z } from 'zod';

export const checkTypes = [
  'check_in',
  'check_out',
  'bus_pickup_home',
  'bus_drop_school',
  'bus_pickup_school',
  'bus_drop_home'
] as const;

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

export const busDeviceSchema = z.object({
  device_id: z.string().min(1),
  device_name: z.string().min(1),
  location_type: z.enum(['gate', 'home_pickup', 'school_drop', 'school_pickup', 'home_drop']),
  bus_route_id: z.string().optional(),
  bus_stop_id: z.string().optional(),
});

export const idSchema = z.string().cuid();

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const attendanceQuerySchema = z.object({
  orgId: z.string().cuid(),
  studentId: z.string().cuid().optional(),
  deviceId: z.string().optional(),
  busRouteId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
}).strict();

export const busRouteSchema = z.object({
  name: z.string().min(2, 'Route name is required'),
  routeCode: z.string().min(2, 'Route code is required'),
  morningStart: z.string().optional(),
  eveningEnd: z.string().optional(),
}).strict();

export type ScanAttendanceInput = z.infer<typeof scanAttendanceSchema>;
export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
export type BusRouteInput = z.infer<typeof busRouteSchema>;
