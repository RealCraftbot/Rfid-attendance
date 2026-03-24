export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser, findUserByEmail } from '@/lib/auth';

const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  orgName: z.string().min(2, 'Organization name is required'),
}).strict();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password, orgName } = parsed.data;

    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const slug = orgName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const orgId = `org_${Date.now()}`;

    const user = createUser({
      email,
      password,
      name: 'Admin User',
      role: 'ADMIN',
      orgId,
      organization: {
        id: orgId,
        name: orgName,
        slug,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Organization and admin account created successfully',
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
    console.error('[Signup Error]', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
