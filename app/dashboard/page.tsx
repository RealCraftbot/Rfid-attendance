'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  History
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';
import ParentDashboard from './parent/page';

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-brand-navy/5 rounded-xl border border-brand-navy/10">
        <Icon size={24} className="text-brand-navy" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
        trend === 'up' ? 'bg-brand-green/10 text-brand-green' : 'bg-red-50 text-red-600'
      }`}>
        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {change}%
      </div>
    </div>
    <div>
      <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">{value}</h3>
    </div>
  </div>
);

export default function DashboardPage() {
  const { organization, role } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0
  });
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([
    { day: 'Mon', present: 42, total: 50 },
    { day: 'Tue', present: 45, total: 50 },
    { day: 'Wed', present: 38, total: 50 },
    { day: 'Thu', present: 48, total: 50 },
    { day: 'Fri', present: 44, total: 50 },
    { day: 'Sat', present: 12, total: 50 },
    { day: 'Sun', present: 5, total: 50 },
  ]);

  useEffect(() => {
    if (!organization?.id || (role !== 'admin' && role !== 'teacher')) return;

    // 1. Real-time stats
    const studentsRef = collection(db, 'organizations', organization.id, 'students');
    const attendanceRef = collection(db, 'organizations', organization.id, 'attendance_records');

    // Get total students
    const unsubStudents = onSnapshot(studentsRef, (snap) => {
      setStats(prev => ({ ...prev, totalStudents: snap.size }));
    });

    // Get present today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const presentQuery = query(
      attendanceRef, 
      where('scan_time', '>=', startOfToday),
      where('check_type', '==', 'check-in')
    );
    const unsubPresent = onSnapshot(presentQuery, (snap) => {
      const uniqueStudents = new Set(snap.docs.map(doc => doc.data().student_id));
      setStats(prev => ({ 
        ...prev, 
        presentToday: uniqueStudents.size,
        absentToday: Math.max(0, prev.totalStudents - uniqueStudents.size),
        attendanceRate: prev.totalStudents > 0 ? Math.round((uniqueStudents.size / prev.totalStudents) * 100) : 0
      }));
    });

    // 2. Recent attendance feed
    const recentQuery = query(attendanceRef, orderBy('scan_time', 'desc'), limit(10));
    const unsubRecent = onSnapshot(recentQuery, (snap) => {
      setRecentAttendance(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubStudents();
      unsubPresent();
      unsubRecent();
    };
  }, [organization, role]);

  if (role === 'parent') {
    return <ParentDashboard />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today at {organization?.name}.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          change="12" 
          icon={Users} 
          trend="up" 
        />
        <StatCard 
          title="Present Today" 
          value={stats.presentToday} 
          change="8" 
          icon={UserCheck} 
          trend="up" 
        />
        <StatCard 
          title="Absent Today" 
          value={stats.absentToday} 
          change="2" 
          icon={UserMinus} 
          trend="down" 
        />
        <StatCard 
          title="Attendance Rate" 
          value={`${stats.attendanceRate}%`} 
          change="5" 
          icon={ArrowUpRight} 
          trend="up" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Attendance Trends</h3>
              <p className="text-sm text-zinc-500">Weekly overview of student presence</p>
            </div>
            <select className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 outline-none focus:ring-2 ring-zinc-100">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0143DF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0143DF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #e4e4e7',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="present" 
                  stroke="#0143DF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPresent)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-zinc-900">Live Feed</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Real-time</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {recentAttendance.length > 0 ? recentAttendance.map((record) => (
              <div key={record.id} className="flex items-start gap-4 group">
                <div className={`mt-1 p-2 rounded-lg ${
                  record.check_type === 'check-in' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-blue/10 text-brand-blue'
                }`}>
                  <Clock size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-zinc-900">{record.student_name}</p>
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                      {record.scan_time?.toDate ? format(record.scan_time.toDate(), 'HH:mm') : 'Just now'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {record.check_type === 'check-in' ? 'Checked in' : 'Checked out'} at {record.device_id}
                  </p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-2">
                <History size={48} strokeWidth={1} />
                <p className="text-sm">No activity recorded yet</p>
              </div>
            )}
          </div>

          <button className="mt-6 w-full py-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 text-sm font-bold rounded-xl transition-colors border border-zinc-200">
            View All History
          </button>
        </div>
      </div>
    </div>
  );
}
