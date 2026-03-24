'use client';

import React, { useState } from 'react';
import { Users, BookOpen, Clock, TrendingUp, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const mockData = {
  className: 'Grade 5A',
  totalStudents: 28,
  presentToday: 25,
  absentToday: 3,
  attendanceRate: 89,
  recentActivity: [
    { id: '1', student: 'John Doe', time: '08:30', status: 'check_in' },
    { id: '2', student: 'Jane Smith', time: '08:32', status: 'check_in' },
    { id: '3', student: 'Mike Johnson', time: '08:35', status: 'check_in' },
  ],
};

export default function TeacherDashboard() {
  const [data] = useState(mockData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Teacher Dashboard</h1>
        <p className="text-zinc-500 mt-1">{data.className} - Today&apos;s Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <span className="text-sm text-zinc-500">Total Students</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{data.totalStudents}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <span className="text-sm text-zinc-500">Present Today</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{data.presentToday}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <span className="text-sm text-zinc-500">Absent Today</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{data.absentToday}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <span className="text-sm text-zinc-500">Attendance Rate</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{data.attendanceRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={20} className="text-zinc-400" />
            <h2 className="text-lg font-bold text-zinc-900">Recent Check-ins</h2>
          </div>
          <div className="space-y-3">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-600">
                    {activity.student.charAt(0)}
                  </div>
                  <span className="font-medium text-zinc-900">{activity.student}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-500">{activity.time}</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    {activity.status === 'check_in' ? 'In' : 'Out'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={20} className="text-zinc-400" />
            <h2 className="text-lg font-bold text-zinc-900">My Classes</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <div>
                <p className="font-medium text-zinc-900">Grade 5A</p>
                <p className="text-sm text-zinc-500">Mathematics</p>
              </div>
              <span className="text-sm font-medium text-zinc-600">28 students</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <div>
                <p className="font-medium text-zinc-900">Grade 5B</p>
                <p className="text-sm text-zinc-500">Mathematics</p>
              </div>
              <span className="text-sm font-medium text-zinc-600">25 students</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
