'use client';

import useSWR from 'swr';
import { Users, UserCheck, UserMinus, ArrowUpRight, ArrowDownRight, Clock, History } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const StatCard = ({ title, value, change, icon: Icon, trend }: { title: string; value: string | number; change: string; icon: any; trend: 'up' | 'down' }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3 sm:mb-4">
      <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl">
        <Icon size={18} className="sm:w-6 sm:h-6 text-blue-600" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {change}%
      </div>
    </div>
    <div>
      <p className="text-zinc-500 text-xs sm:text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900">{value}</h3>
    </div>
  </div>
);

interface DashboardClientProps {
  orgId: string;
  orgName: string;
  initialData: DashboardData;
}

export default function DashboardClient({ orgId, orgName, initialData }: DashboardClientProps) {
  const { data } = useSWR<DashboardData>(`/api/dashboard?orgId=${orgId}`, fetcher, {
    refreshInterval: 10000,
    fallbackData: initialData,
  });

  const chartData = [
    { day: 'Mon', present: 42, total: 50 },
    { day: 'Tue', present: 45, total: 50 },
    { day: 'Wed', present: 38, total: 50 },
    { day: 'Thu', present: 48, total: 50 },
    { day: 'Fri', present: 44, total: 50 },
  ];

  const stats = data || initialData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Dashboard Overview</h1>
        <p className="text-zinc-500 mt-1 text-sm sm:text-base">Welcome back! Here&apos;s what&apos;s happening at {orgName}.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Total Students" value={stats.totalStudents} change="12" icon={Users} trend="up" />
        <StatCard title="Present Today" value={stats.presentToday} change="8" icon={UserCheck} trend="up" />
        <StatCard title="Absent Today" value={stats.absentToday} change="2" icon={UserMinus} trend="down" />
        <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} change="5" icon={ArrowUpRight} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Attendance Trends</h3>
              <p className="text-xs sm:text-sm text-zinc-500">Weekly overview</p>
            </div>
            <select className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 outline-none focus:ring-2 w-full sm:w-auto">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[250px] sm:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e4e4e7' }} />
                <Area type="monotone" dataKey="present" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-8 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg font-bold text-zinc-900">Live Feed</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:inline">Real-time</span>
            </div>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {stats.recentRecords.length > 0 ? stats.recentRecords.map((record) => (
              <div key={record.id} className="flex items-start gap-3 sm:gap-4">
                <div className={`mt-1 p-1.5 sm:p-2 rounded-lg ${record.checkType === 'check_in' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  <Clock size={14} className="sm:w-4 sm:h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-zinc-900 truncate">{record.studentName}</p>
                    <span className="text-[10px] sm:text-xs font-medium text-zinc-400 ml-2 whitespace-nowrap">
                      {format(new Date(record.scanTime), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {record.checkType === 'check_in' ? 'Checked in' : 'Checked out'}
                  </p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400 space-y-2">
                <History size={40} strokeWidth={1} className="sm:w-12 sm:h-12" />
                <p className="text-sm">No activity recorded yet</p>
              </div>
            )}
          </div>

          <button className="mt-4 sm:mt-6 w-full py-2.5 sm:py-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 text-sm font-bold rounded-xl transition-colors border border-zinc-200">
            View All History
          </button>
        </div>
      </div>
    </div>
  );
}
