'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, ShieldCheck, ShieldAlert, UserPlus, Loader2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  org: string;
  status: string;
}

const RoleBadge = ({ role }: { role: string }) => {
  const colors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700',
    ADMIN: 'bg-purple-100 text-purple-700',
    TEACHER: 'bg-blue-100 text-blue-700',
    PARENT: 'bg-green-100 text-green-700',
    BURSAR: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
      <ShieldCheck size={12} />
      {role.replace('_', ' ')}
    </span>
  );
};

export default function SuperAdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/super-admin/users');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUsers(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">User Management</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Manage platform administrators and users</p>
        </div>
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:bg-zinc-800 text-sm">
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="p-3 md:p-4 border-b border-zinc-200">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase">User</th>
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase hidden sm:table-cell">Role</th>
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase hidden md:table-cell">Organization</th>
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50">
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                        <Users size={16} className="md:w-5 md:h-5 text-zinc-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900 text-sm md:text-base truncate">{user.name}</p>
                        <p className="text-[10px] md:text-sm text-zinc-500 hidden sm:block truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-zinc-600 hidden md:table-cell">{user.org}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-medium rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'active' ? <ShieldCheck size={10} className="md:w-3 md:h-3" /> : <ShieldAlert size={10} className="md:w-3 md:h-3" />}
                      <span className="hidden sm:inline">{user.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 md:px-6 py-8 text-center text-zinc-500">
                    {searchTerm ? 'No users match your search' : 'No users found'}
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
