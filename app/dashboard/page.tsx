import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DashboardClient from './DashboardClient';
import TimetableEditor from '@/components/TimetableEditor';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  if (user.role === 'PARENT') {
    redirect('/dashboard/parent');
  }

  if (user.role === 'BURSAR') {
    redirect('/dashboard/bursar');
  }

  const orgId = user.orgId || user.organization?.id;

  if (!orgId) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <DashboardClient orgId={orgId} orgName={user.organization?.name || ''} />
      <TimetableEditor orgId={orgId} orgName={user.organization?.name || ''} />
    </div>
  );
}
