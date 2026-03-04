'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Cpu, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const AdminStatCard = ({ title, value, change, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl border ${color}`}>
        <Icon size={24} />
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

export default function SuperAdminDashboard() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalOrgs: 0,
    totalStudents: 0,
    totalDevices: 0,
    totalScans: 0
  });

  useEffect(() => {
    if (!db) return;

    // 1. Get all organizations
    const orgsRef = collection(db, 'organizations');
    const unsubOrgs = onSnapshot(orgsRef, (snap) => {
      const orgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrganizations(orgs);
      setGlobalStats(prev => ({ ...prev, totalOrgs: snap.size }));
    });

    // In a real app, we'd use a Cloud Function or a global stats doc
    // For this demo, we'll simulate some global stats
    const timer = setTimeout(() => {
      setGlobalStats(prev => ({
        ...prev,
        totalStudents: 1240,
        totalDevices: 85,
        totalScans: 45200
      }));
    }, 1000);

    return () => {
      unsubOrgs();
      clearTimeout(timer);
    };
  }, []);

  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Platform Console</h1>
          <p className="text-zinc-500 mt-1">Global overview of your RFID SaaS platform.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-green/10 text-brand-green rounded-xl border border-brand-green/20 text-sm font-bold">
          <Globe size={16} />
          System Online
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard 
          title="Total Organizations" 
          value={globalStats.totalOrgs} 
          change="12" 
          icon={Building2} 
          trend="up" 
          color="bg-brand-blue/10 border-brand-blue/20 text-brand-blue"
        />
        <AdminStatCard 
          title="Total Students" 
          value={globalStats.totalStudents} 
          change="8" 
          icon={Users} 
          trend="up" 
          color="bg-brand-purple/10 border-brand-purple/20 text-brand-navy"
        />
        <AdminStatCard 
          title="Total Devices" 
          value={globalStats.totalDevices} 
          change="5" 
          icon={Cpu} 
          trend="up" 
          color="bg-brand-lime/10 border-brand-lime/20 text-brand-navy"
        />
        <AdminStatCard 
          title="Total Scans" 
          value={globalStats.totalScans.toLocaleString()} 
          change="24" 
          icon={Activity} 
          trend="up" 
          color="bg-brand-green/10 border-brand-green/20 text-brand-green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Platform Growth</h3>
              <p className="text-sm text-zinc-500">New organization signups over time</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <TrendingUp size={18} />
              +15% this month
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="name" 
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
                  cursor={{ fill: '#f8f9fa' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #e4e4e7',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#3FF29C' : '#0143DF'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Organizations */}
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-zinc-900">Recent Signups</h3>
            <button className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">View All</button>
          </div>
          
          <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {organizations.length > 0 ? organizations.slice(0, 6).map((org) => (
              <div key={org.id} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
                  {org.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-zinc-900">{org.name}</p>
                    <button className="text-zinc-400 hover:text-zinc-900">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${org.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{org.plan} Plan</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-2">
                <Building2 size={48} strokeWidth={1} />
                <p className="text-sm">No organizations yet</p>
              </div>
            )}
          </div>

          <Link 
            href="/super-admin/organizations"
            className="mt-6 w-full py-3 bg-brand-navy text-white text-sm font-bold rounded-xl transition-all hover:bg-brand-navy/90 flex items-center justify-center gap-2"
          >
            Manage Organizations
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
