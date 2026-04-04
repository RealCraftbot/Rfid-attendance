import { z } from 'zod';

// Common password blacklist (top 1000 common passwords should be checked server-side)
const commonPasswords = [
  'password', '123456', '12345678', 'qwerty', '123456789',
  'letmein', '1234567', 'football', 'iloveyou', 'admin',
  'welcome', 'monkey', 'login', 'abc123', '111111',
  '123123', 'password123', '1234', 'baseball', 'qwertyuiop',
];

export const checkTypes = [
  'check_in',
  'check_out',
  'bus_pickup_home',
  'bus_drop_school',
  'bus_pickup_school',
  'bus_drop_home'
] as const;

// Enhanced password validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .refine(
    (password) => !commonPasswords.includes(password.toLowerCase()),
    { message: 'Password is too common. Please choose a more unique password.' }
  )
  .refine(
    (password) => !/(.)\1{2,}/.test(password),
    { message: 'Password cannot contain repeated characters (e.g., "aaa", "111").' }
  );

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

// Enhanced signup schema with strong password
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  orgName: z.string().min(2, 'Organization name is required').max(100, 'Organization name too long'),
}).strict();

// Input sanitization helper
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent basic XSS
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 1000); // Limit length
}

// Sanitize object recursively
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

export type ScanAttendanceInput = z.infer<typeof scanAttendanceSchema>;
export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
export type BusRouteInput = z.infer<typeof busRouteSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
