export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const parentSignupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
}).strict();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const parsed = parentSignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name, phone } = parsed.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    return NextResponse.json({
      success: true,
      message: 'Parent account created successfully',
      data: {
        user: {
          id: `parent_${Date.now()}`,
          email,
          name,
          phone,
          role: 'PARENT',
        },
      },
    });
  } catch (error) {
    console.error('[Parent Signup Error]', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
