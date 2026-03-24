'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { Baby, Calendar, Clock, Bell } from 'lucide-react';
import { format } from 'date-fns';

const mockChildren = [
  { id: '1', name: 'John Doe', grade: 'Grade 5', avatar: '' },
  { id: '2', name: 'Jane Doe', grade: 'Grade 3', avatar: '' },
];

const mockAttendance = [
  { id: '1', childId: '1', date: new Date().toISOString(), status: 'check_in', time: '08:30' },
  { id: '2', childId: '2', date: new Date().toISOString(), status: 'check_in', time: '08:45' },
];

export default function ParentDashboard() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Parent Dashboard</h1>
        <p className="text-zinc-500 mt-1 text-sm md:text-base">Monitor your children&apos;s attendance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {mockChildren.map((child) => (
          <div key={child.id} className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Baby size={20} className="md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-sm md:text-base">{child.name}</h3>
                <p className="text-xs md:text-sm text-zinc-500">{child.grade}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-zinc-500">Today&apos;s Status</span>
                <span className="text-green-600 font-medium">Present</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-zinc-500">Check-in</span>
                <span className="font-medium">08:30 AM</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 md:p-6">
        <h2 className="text-base md:text-lg font-bold text-zinc-900 mb-3 md:mb-4">Recent Activity</h2>
        <div className="space-y-3 md:space-y-4">
          {mockAttendance.map((record) => (
            <div key={record.id} className="flex items-center justify-between py-2 md:py-3 border-b border-zinc-100 last:border-0">
              <div className="flex items-center gap-2 md:gap-3">
                <Clock size={16} className="md:w-[18px] md:h-[18px] text-zinc-400" />
                <div>
                  <p className="font-medium text-zinc-900 text-sm md:text-base">{format(new Date(record.date), 'EEE, MMM d')}</p>
                  <p className="text-xs md:text-sm text-zinc-500">{record.status === 'check_in' ? 'Checked in' : 'Checked out'}</p>
                </div>
              </div>
              <span className="text-xs md:text-sm font-medium text-zinc-900">{record.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
