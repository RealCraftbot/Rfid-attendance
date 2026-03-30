import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { success, validationError, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { NextRequest } from 'next/server';

// Schema for validation
const timetableSchema = z.object({
  orgId: z.string().min(1, 'Organization ID is required'),
  day: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ], { message: 'Invalid day of week' }),
  period: z.number().int().positive('Period must be a positive integer'),
  subject: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  classroomId: z.string().min(1, 'Classroom ID is required'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
});

// Validate time order
const validateTimeOrder = (startTime: string, endTime: string): boolean => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  return endTotal > startTotal;
};

// Middleware to check user role
const requireAuth = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session.user;
};

// GET /api/timetable - Retrieve all timetables for an organization
export async function GET(request: NextRequest) {
  try {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) {
      return result;
    }
    const { orgId } = result;
    
    if (!orgId) {
      return forbidden('Organization ID is required');
    }
    
    const timetables = await prisma.timetable.findMany({
      where: { orgId },
      orderBy: {
        day: 'asc',
        period: 'asc'
      }
    });
    
    return success(timetables);
  } catch (error) {
    console.error('[Timetable API Error]', error);
    return serverError('Failed to retrieve timetables');
  }
}

// POST /api/timetable - Create a new timetable entry
export async function POST(request: NextRequest) {
  try {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) {
      return result;
    }
    const orgId = result.orgId;
    
    if (!orgId) {
      return forbidden('Organization ID is required');
    }
    
    const body = await request.json();
    const parsed = timetableSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    
    // Validate time order
    if (!validateTimeOrder(parsed.data.startTime, parsed.data.endTime)) {
      return NextResponse.json({
        success: false,
        error: 'End time must be after start time'
      }, { status: 400 });
    }
    
    // Check if timetable entry already exists for this day and period
    const existing = await prisma.timetable.findUnique({
      where: {
        orgId_day_period: {
          orgId,
          day: parsed.data.day,
          period: parsed.data.period
        }
      }
    });
    
    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Timetable entry already exists for this day and period'
      }, { status: 400 });
    }
    
    const timetable = await prisma.timetable.create({
      data: {
        ...parsed.data,
        orgId
      }
    });
    
    return success(timetable);
  } catch (error) {
    console.error('[Timetable API Error]', error);
    return serverError('Failed to create timetable entry');
  }
}

// PUT /api/timetable - Update a timetable entry
export async function PUT(request: NextRequest) {
  try {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) {
      return result;
    }
    const orgId = result.orgId;
    
    if (!orgId) {
      return forbidden('Organization ID is required');
    }
    
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Timetable ID is required'
      }, { status: 400 });
    }
    
    const parsed = timetableSchema.safeParse(data);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    
    // Validate time order
    if (!validateTimeOrder(parsed.data.startTime, parsed.data.endTime)) {
      return NextResponse.json({
        success: false,
        error: 'End time must be after start time'
      }, { status: 400 });
    }
    
    // Check if timetable entry exists
    const existing = await prisma.timetable.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return NextResponse.json({
        success: false,
        error: 'Timetable entry not found'
      }, { status: 404 });
    }
    
    // Check if another entry exists for this day and period (excluding current entry)
    const conflict = await prisma.timetable.findUnique({
      where: {
        orgId_day_period: {
          orgId,
          day: parsed.data.day,
          period: parsed.data.period
        }
      }
    });
    
    if (conflict && conflict.id !== id) {
      return NextResponse.json({
        success: false,
        error: 'Timetable entry already exists for this day and period'
      }, { status: 400 });
    }
    
    const timetable = await prisma.timetable.update({
      where: { id },
      data: {
        ...parsed.data,
        orgId
      }
    });
    
    return success(timetable);
  } catch (error) {
    console.error('[Timetable API Error]', error);
    return serverError('Failed to update timetable entry');
  }
}

// DELETE /api/timetable - Delete a timetable entry
export async function DELETE(request: NextRequest) {
  try {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) {
      return result;
    }
    const orgId = result.orgId;
    
    if (!orgId) {
      return forbidden('Organization ID is required');
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Timetable ID is required'
      }, { status: 400 });
    }
    
    // Check if timetable entry exists
    const existing = await prisma.timetable.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return NextResponse.json({
        success: false,
        error: 'Timetable entry not found'
      }, { status: 404 });
    }
    
    await prisma.timetable.delete({
      where: { id }
    });
    
    return success({ deleted: true });
  } catch (error) {
    console.error('[Timetable API Error]', error);
    return serverError('Failed to delete timetable entry');
  }
}