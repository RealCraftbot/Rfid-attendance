export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { signupSchema, sanitizeObject } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { AuditLogger } from '@/lib/audit-logger';

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    // Sanitize inputs
    const sanitizedBody = sanitizeObject(body);
    
    const parsed = signupSchema.safeParse(sanitizedBody);
    if (!parsed.success) {
      // Log failed signup attempt
      await AuditLogger.log({
        action: 'USER_CREATE',
        status: 'FAILURE',
        errorMessage: 'Validation failed: ' + parsed.error.issues.map(i => i.message).join(', '),
        details: { email: sanitizedBody.email },
      });
      
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
      await AuditLogger.log({
        action: 'USER_CREATE',
        status: 'FAILURE',
        errorMessage: 'Email already registered',
        details: { email },
      });
      
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check if organization with this email already exists
    const existingOrgByEmail = await prisma.organization.findUnique({
      where: { email },
    });

    if (existingOrgByEmail) {
      await AuditLogger.log({
        action: 'ORGANIZATION_CREATE',
        status: 'FAILURE',
        errorMessage: 'Organization with this email already exists',
        details: { email, orgName },
      });
      
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
      await AuditLogger.log({
        action: 'ORGANIZATION_CREATE',
        status: 'FAILURE',
        errorMessage: 'Organization name already taken',
        details: { orgName, slug },
      });
      
      return NextResponse.json(
        { error: 'Organization name already taken' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12); // Increased rounds for better security

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create organization first
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          slug,
          email,
          status: 'ACTIVE',
        },
      });

      // Create admin user (unverified - will need OTP verification)
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          orgId: organization.id,
        },
      });

      return { organization, user };
    });

    // Send OTP for email verification
    try {
      const otpResponse = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'verification' }),
      });

      if (!otpResponse.ok) {
        console.error('Failed to send OTP:', await otpResponse.text());
      }
    } catch (otpError) {
      // Log but don't fail - user is created, they can resend verification
      console.error('OTP sending failed:', otpError);
    }

    // Log successful signup
    await AuditLogger.log({
      action: 'USER_CREATE',
      userId: result.user.id,
      orgId: result.organization.id,
      status: 'SUCCESS',
      details: { 
        email,
        orgName,
        orgId: result.organization.id,
        processingTime: Date.now() - startTime,
      },
    });

    await AuditLogger.log({
      action: 'ORGANIZATION_CREATE',
      userId: result.user.id,
      orgId: result.organization.id,
      status: 'SUCCESS',
      details: { 
        orgName,
        slug,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email for verification.',
      userId: result.user.id,
      orgId: result.organization.id,
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    
    await AuditLogger.log({
      action: 'USER_CREATE',
      status: 'FAILURE',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
