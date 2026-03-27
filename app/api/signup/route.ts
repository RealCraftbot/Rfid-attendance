export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered as a user' },
        { status: 409 }
      );
    }

    // Check if organization with this email already exists
    const existingOrgByEmail = await prisma.organization.findUnique({
      where: { email },
    });

    if (existingOrgByEmail) {
      return NextResponse.json(
        { error: 'An organization with this email already exists' },
        { status: 409 }
      );
    }

    // Create slug from org name
    const slug = orgName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if organization slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization name already taken' },
        { status: 409 }
      );
    }

    // Create organization first
    const organization = await prisma.organization.create({
      data: {
        name: orgName,
        slug,
        email,
        status: 'ACTIVE',
      },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user (unverified - will need OTP verification)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        orgId: organization.id,
      },
    });

    // Send OTP for email verification
    try {
      await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'verification' }),
      });
    } catch (otpError) {
      console.error('Failed to send OTP:', otpError);
      // Don't fail signup if OTP fails, user can request again
    }

    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email for OTP verification.',
      requiresVerification: true,
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
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: 'Email already exists in our system' },
          { status: 409 }
        );
      }
      if (error.message.includes('slug')) {
        return NextResponse.json(
          { error: 'Organization name already taken' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
