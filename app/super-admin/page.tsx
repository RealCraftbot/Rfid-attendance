'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Users, Cpu, Activity, TrendingUp, ArrowUpRight, ArrowDownRight, Globe, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Stat {
  title: string;
  value: number;
  change: number;
  icon: string;
  trend: string;
  color: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  users: number;
  students: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, orgsRes] = await Promise.all([
          fetch('/api/super-admin/stats'),
          fetch('/api/super-admin/organizations')
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setStats(statsData.data);
          }
        }

        if (orgsRes.ok) {
          const orgsData = await orgsRes.json();
          if (orgsData.success) {
            setOrganizations(orgsData.data.slice(0, 5));
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Building2,
    Users,
    Cpu,
    Activity,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Platform Overview</h1>
        <p className="text-zinc-500 mt-1 text-sm md:text-base">Monitor all organizations and platform metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, i) => {
          const Icon = iconMap[stat.icon] || Activity;
          return (
            <div key={i} className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className={`p-2 md:p-3 rounded-xl ${stat.color}`}>
                  <Icon size={18} className="md:w-6 md:h-6" />
                </div>
                <div className={`flex items-center gap-1 text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={10} className="md:w-3 md:h-3" /> : <ArrowDownRight size={10} className="md:w-3 md:h-3" />}
                  {stat.change}%
                </div>
              </div>
              <p className="text-zinc-500 text-[10px] md:text-sm font-medium mb-1">{stat.title}</p>
              <h3 className="text-xl md:text-3xl font-bold text-zinc-900">{stat.value.toLocaleString()}</h3>
            </div>
          );
        })}
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
              {organizations.map((org) => (
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
              {organizations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 md:px-6 py-8 text-center text-zinc-500">
                    No organizations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
