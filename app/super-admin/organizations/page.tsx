'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Mail,
  Calendar
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export default function SuperAdminOrganizations() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'organizations'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setOrganizations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredOrgs = organizations.filter(org => 
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.admin_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Organizations</h1>
          <p className="text-zinc-500 mt-1">Manage all registered organizations and their subscription status</p>
        </div>
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-95">
          <Download size={20} />
          Export All Data
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by organization name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-200">
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Organization</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Admin Email</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Plan</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredOrgs.map((org) => (
              <tr key={org.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold border border-zinc-200">
                      {org.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{org.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">{org.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Mail size={14} />
                    <span className="text-sm">{org.admin_email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    org.plan === 'enterprise' 
                      ? 'bg-purple-50 text-purple-600 border-purple-100' 
                      : org.plan === 'professional'
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  }`}>
                    {org.plan || 'Free'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Calendar size={14} />
                    <span className="text-xs">
                      {org.created_at?.toDate ? format(org.created_at.toDate(), 'MMM d, yyyy') : 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    org.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {org.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {org.status || 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
                      <ExternalLink size={16} />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-4">
            <div className="w-8 h-8 border-4 border-zinc-900 rounded-full border-t-transparent animate-spin" />
            <p className="text-sm font-bold uppercase tracking-widest">Loading Organizations...</p>
          </div>
        )}

        {!loading && filteredOrgs.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-4">
            <Building2 size={48} strokeWidth={1} />
            <div className="text-center">
              <p className="font-bold text-zinc-900">No organizations found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
