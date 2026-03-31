export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError, validationError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const deviceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  deviceId: z.string().min(4, 'Device ID is required'),
  location: z.string().optional(),
  locationType: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;

    const devices = await prisma.device.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });

    return success(devices);
  } catch (error) {
    console.error('[Devices API Error]', error);
    return serverError('Failed to fetch devices');
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const body = await request.json();
    
    const parsed = deviceSchema.safeParse(body);
    
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // Check if device already exists
    const existing = await prisma.device.findUnique({
      where: {
        orgId_deviceId: {
          orgId,
          deviceId: parsed.data.deviceId,
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Device with this ID already exists' },
        { status: 400 }
      );
    }

    // Generate a secret key
    const secretKey = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const device = await prisma.device.create({
      data: {
        name: parsed.data.name,
        deviceId: parsed.data.deviceId,
        secretKey,
        orgId,
        location: parsed.data.location,
        locationType: parsed.data.locationType || 'gate',
      },
    });

    return success({
      ...device,
      secretKey // Return the generated secret key
    }, 201);
  } catch (error) {
    console.error('[Devices API Error]', error);
    return serverError('Failed to create device');
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Device ID required' },
        { status: 400 }
      );
    }

    // Check if device exists
    const existing = await prisma.device.findFirst({
      where: { id, orgId }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }

    const device = await prisma.device.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        locationType: data.locationType,
        isActive: data.isActive,
      },
    });

    return success(device);
  } catch (error) {
    console.error('[Devices API Error]', error);
    return serverError('Failed to update device');
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Device ID required' },
        { status: 400 }
      );
    }

    // Check if device exists
    const existing = await prisma.device.findFirst({
      where: { id, orgId }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }

    await prisma.device.delete({
      where: { id }
    });

    return success({ deleted: true });
  } catch (error) {
    console.error('[Devices API Error]', error);
    return serverError('Failed to delete device');
  }
}
