export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const mockData = {
      totalStudents: 150,
      presentToday: 142,
      absentToday: 8,
      attendanceRate: 95,
      recentRecords: [
        {
          id: '1',
          studentName: 'John Doe',
          checkType: 'check_in',
          scanTime: new Date().toISOString(),
          deviceId: 'main-gate',
        },
        {
          id: '2',
          studentName: 'Jane Smith',
          checkType: 'check_out',
          scanTime: new Date().toISOString(),
          deviceId: 'main-gate',
        },
        {
          id: '3',
          studentName: 'Michael Johnson',
          checkType: 'check_in',
          scanTime: new Date().toISOString(),
          deviceId: 'side-entrance',
        },
      ],
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('[Dashboard API Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
