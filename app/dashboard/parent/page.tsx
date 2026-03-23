'use client';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Parent Dashboard</h1>
        <p className="text-zinc-500 mt-1">Monitor your children&apos;s attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockChildren.map((child) => (
          <div key={child.id} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Baby size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">{child.name}</h3>
                <p className="text-sm text-zinc-500">{child.grade}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Today&apos;s Status</span>
                <span className="text-green-600 font-medium">Present</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Check-in</span>
                <span className="font-medium">08:30 AM</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {mockAttendance.map((record) => (
            <div key={record.id} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-zinc-400" />
                <div>
                  <p className="font-medium text-zinc-900">{format(new Date(record.date), 'EEEE, MMM d')}</p>
                  <p className="text-sm text-zinc-500">{record.status === 'check_in' ? 'Checked in' : 'Checked out'}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-zinc-900">{record.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
