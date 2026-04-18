import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AdminEnrollmentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-brand-navy mb-6">Enrollments</h1>
      <AdminEnrollmentsClient />
    </div>
  );
}

function AdminEnrollmentsClient() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-medium">
            All
          </button>
          <button className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-200">
            Pending
          </button>
          <button className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-200">
            Approved
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Student</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Parent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Grade</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Date</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            <tr className="hover:bg-zinc-50">
              <td className="px-4 py-3">
                <p className="font-medium text-brand-navy">John Doe</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-sm text-zinc-600">John Parent</p>
                <p className="text-xs text-zinc-400">parent@email.com</p>
              </td>
              <td className="px-4 py-3 text-sm text-zinc-600">Grade 1</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  Pending
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-zinc-500">Apr 18, 2026</td>
              <td className="px-4 py-3 text-right">
                <button className="text-brand-blue hover:underline text-sm font-medium">
                  Review
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}