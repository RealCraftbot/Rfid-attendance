export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const teacherSignupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name is required'),
  orgCode: z.string().min(1, 'Organization code is required'),
}).strict();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const parsed = teacherSignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name, orgCode } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Find organization by code (using slug as code for now)
    const organization = await prisma.organization.findFirst({
      where: { 
        OR: [
          { slug: orgCode.toLowerCase() },
          { id: orgCode },
        ]
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Invalid organization code' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create teacher user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'TEACHER',
        orgId: organization.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher account created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
        },
      },
    });
  } catch (error) {
    console.error('[Teacher Signup Error]', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
