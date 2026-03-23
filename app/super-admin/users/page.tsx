'use client';

import React, { useState } from 'react';
import { Users, Search, Shield, ShieldCheck, ShieldAlert, UserPlus } from 'lucide-react';

const mockUsers = [
  { id: '1', name: 'John Admin', email: 'john@admin.com', role: 'SUPER_ADMIN', org: 'Platform', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@greenwood.edu', role: 'ADMIN', org: 'Greenwood Academy', status: 'active' },
  { id: '3', name: 'Bob Teacher', email: 'bob@sunrise.edu', role: 'TEACHER', org: 'Sunrise School', status: 'active' },
  { id: '4', name: 'Alice Parent', email: 'alice@email.com', role: 'PARENT', org: 'Greenwood Academy', status: 'active' },
];

const RoleBadge = ({ role }: { role: string }) => {
  const colors = {
    SUPER_ADMIN: 'bg-red-100 text-red-700',
    ADMIN: 'bg-purple-100 text-purple-700',
    TEACHER: 'bg-blue-100 text-blue-700',
    PARENT: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${colors[role as keyof typeof colors]}`}>
      <ShieldCheck size={12} />
      {role.replace('_', ' ')}
    </span>
  );
};

export default function SuperAdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const users = mockUsers;

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">User Management</h1>
          <p className="text-zinc-500 mt-1">Manage platform administrators and users</p>
        </div>
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800">
          <UserPlus size={20} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="p-4 border-b border-zinc-200">
          <div className="relative max-w-md">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                        <Users size={20} className="text-zinc-600" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{user.name}</p>
                        <p className="text-sm text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{user.org}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'active' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
