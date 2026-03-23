export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Database seeding endpoint. Connect Prisma to enable.',
      instructions: {
        method: 'POST',
        body: {
          orgName: 'string',
          adminEmail: 'string',
          adminPassword: 'string',
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get seed info' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgName, adminEmail, adminPassword } = body;

    if (!orgName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'orgName, adminEmail, and adminPassword are required' },
        { status: 400 }
      );
    }

    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const mockOrg = {
      id: `org_${Date.now()}`,
      name: orgName,
      slug,
      email: adminEmail,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully (mock mode)',
      data: {
        organization: mockOrg,
        user: {
          id: `user_${Date.now()}`,
          email: adminEmail,
          name: 'Admin User',
          role: 'ADMIN',
          orgId: mockOrg.id,
          passwordSet: true,
        },
      },
    });
  } catch (error) {
    console.error('[Seed Error]', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
