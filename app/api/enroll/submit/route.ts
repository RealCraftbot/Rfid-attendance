import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, validationError, serverError, notFound } from '@/lib/api-response';
import { sanitizeObject } from '@/lib/validation';
import { z } from 'zod';

const submitSchema = z.object({
  orgSlug: z.string().min(1, 'Organization slug required'),
  step1: z.object({
    studentName: z.string().min(2),
    studentDob: z.string().optional(),
    studentGender: z.enum(['Male', 'Female', 'Other']).optional(),
    gradeApplying: z.string().min(1),
  }),
  step2: z.object({
    parentName: z.string().min(2),
    parentEmail: z.string().email(),
    parentPhone: z.string().min(10),
    relationship: z.string().optional(),
  }),
  step3: z.object({
    passportUrl: z.string().url().optional(),
    birthCertUrl: z.string().url().optional(),
    otherDocs: z.string().optional(),
  }).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { orgSlug, step1, step2, step3 } = parsed.data;
    const sanitized = sanitizeObject({ step1, step2, step3 });

    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      select: { id: true },
    });

    if (!org) {
      return notFound('Organization');
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        orgId: org.id,
        studentName: sanitized.step1.studentName,
        studentDob: sanitized.step1.studentDob ? new Date(sanitized.step1.studentDob) : null,
        studentGender: sanitized.step1.studentGender || null,
        gradeApplying: sanitized.step1.gradeApplying || null,
        parentName: sanitized.step2.parentName,
        parentEmail: sanitized.step2.parentEmail,
        parentPhone: sanitized.step2.parentPhone,
        relationship: sanitized.step2.relationship || null,
        passportUrl: sanitized.step3?.passportUrl || null,
        birthCertUrl: sanitized.step3?.birthCertUrl || null,
        otherDocs: sanitized.step3?.otherDocs || null,
      },
    });

    return success({ enrollmentId: enrollment.id, message: 'Enrollment submitted successfully' }, 201);
  } catch (error) {
    console.error('[Enrollment Submit Error]', error);
    return serverError('Failed to submit enrollment');
  }
}