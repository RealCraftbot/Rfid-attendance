import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DashboardClient from './DashboardClient';

interface DashboardData {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
  recentRecords: Array<{
    id: string;
    studentName: string;
    checkType: string;
    scanTime: string;
    deviceId: string;
  }>;
}

const mockData: DashboardData = {
  totalStudents: 150,
  presentToday: 142,
  absentToday: 8,
  attendanceRate: 95,
  recentRecords: [
    { id: '1', studentName: 'John Doe', checkType: 'check_in', scanTime: new Date().toISOString(), deviceId: 'dev_1' },
    { id: '2', studentName: 'Jane Smith', checkType: 'check_out', scanTime: new Date().toISOString(), deviceId: 'dev_1' },
  ],
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  if (user.role === 'PARENT') {
    redirect('/dashboard/parent');
  }

  const orgId = user.orgId || user.organization?.id;

  if (!orgId) {
    redirect('/login');
  }

  return <DashboardClient orgId={orgId} orgName={user.organization?.name || ''} initialData={mockData} />;
}
