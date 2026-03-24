export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

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

    const slug = orgName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const hashedPassword = await bcrypt.hash(password, 10);

    const mockOrg = {
      id: `org_${Date.now()}`,
      name: orgName,
      slug,
      email,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Organization and admin account created successfully',
      data: {
        organization: mockOrg,
        user: {
          id: `user_${Date.now()}`,
          email,
          name: 'Admin User',
          role: 'ADMIN',
          orgId: mockOrg.id,
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
