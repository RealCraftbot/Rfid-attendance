export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser, findUserByEmail } from '@/lib/auth';

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

    const { email, password, name } = parsed.data;

    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const user = createUser({
      email,
      password,
      name,
      role: 'TEACHER',
      orgId: null,
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
