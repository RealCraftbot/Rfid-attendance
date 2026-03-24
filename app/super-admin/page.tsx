'use client';

import React from 'react';
import { Building2, Users, Cpu, Activity, TrendingUp, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';
import Link from 'next/link';

const mockStats = [
  { title: 'Total Organizations', value: '24', change: '12', icon: Building2, trend: 'up', color: 'bg-blue-100 text-blue-600' },
  { title: 'Active Users', value: '1,847', change: '8', icon: Users, trend: 'up', color: 'bg-green-100 text-green-600' },
  { title: 'RFID Devices', value: '156', change: '3', icon: Cpu, trend: 'up', color: 'bg-purple-100 text-purple-600' },
  { title: 'Attendance Today', value: '12,458', change: '5', icon: Activity, trend: 'up', color: 'bg-orange-100 text-orange-600' },
];

const mockOrgs = [
  { id: '1', name: 'Greenwood Academy', slug: 'greenwood-academy', status: 'ACTIVE', users: 245, students: 1200 },
  { id: '2', name: 'Sunrise School', slug: 'sunrise-school', status: 'ACTIVE', users: 89, students: 450 },
  { id: '3', name: 'Tech Valley High', slug: 'tech-valley-high', status: 'TRIAL', users: 12, students: 85 },
];

export default function SuperAdminDashboard() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Platform Overview</h1>
        <p className="text-zinc-500 mt-1 text-sm md:text-base">Monitor all organizations and platform metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {mockStats.map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <div className={`p-2 md:p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={18} className="md:w-6 md:h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {stat.trend === 'up' ? <ArrowUpRight size={10} className="md:w-3 md:h-3" /> : <ArrowDownRight size={10} className="md:w-3 md:h-3" />}
                {stat.change}%
              </div>
            </div>
            <p className="text-zinc-500 text-[10px] md:text-sm font-medium mb-1">{stat.title}</p>
            <h3 className="text-xl md:text-3xl font-bold text-zinc-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="p-4 md:p-6 border-b border-zinc-200">
          <h2 className="text-base md:text-lg font-bold text-zinc-900">Recent Organizations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase">Organization</th>
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase">Status</th>
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase hidden sm:table-cell">Users</th>
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase hidden sm:table-cell">Students</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {mockOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-zinc-50">
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-7 md:w-8 h-7 md:h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Globe size={14} className="md:w-4 md:h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-zinc-900 text-sm md:text-base">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-medium rounded-full ${
                      org.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-zinc-600 hidden sm:table-cell">{org.users}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-zinc-600 hidden sm:table-cell">{org.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
