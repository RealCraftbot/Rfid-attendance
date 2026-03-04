'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  MoreVertical,
  Mail,
  Calendar,
  UserPlus
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export default function SuperAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'users'), orderBy('role', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">User Management</h1>
          <p className="text-zinc-500 mt-1">Manage platform administrators and super admin access</p>
        </div>
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-95">
          <UserPlus size={20} />
          Invite Admin
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by email or role..." 
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
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">UID</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${
                      user.role === 'super-admin' 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                        : 'bg-zinc-100 text-zinc-900 border-zinc-200'
                    }`}>
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{user.email}</p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">Verified User</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    user.role === 'super-admin' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  }`}>
                    {user.role === 'super-admin' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                    {user.role || 'User'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <code className="text-[10px] font-mono bg-zinc-50 px-2 py-1 rounded border border-zinc-200 text-zinc-500">
                    {user.id}
                  </code>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
                      <ShieldAlert size={16} />
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
            <p className="text-sm font-bold uppercase tracking-widest">Loading Users...</p>
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-4">
            <Users size={48} strokeWidth={1} />
            <div className="text-center">
              <p className="font-bold text-zinc-900">No users found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
