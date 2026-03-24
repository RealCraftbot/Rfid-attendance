'use client';

import React, { useState } from 'react';
import { Building2, Search, Download, CheckCircle2, XCircle, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const mockOrgs = [
  { id: '1', name: 'Greenwood Academy', email: 'admin@greenwood.edu', status: 'ACTIVE', createdAt: '2024-01-15', users: 245, students: 1200 },
  { id: '2', name: 'Sunrise School', email: 'admin@sunrise.edu', status: 'ACTIVE', createdAt: '2024-02-20', users: 89, students: 450 },
  { id: '3', name: 'Tech Valley High', email: 'admin@techvalley.edu', status: 'TRIAL', createdAt: '2024-03-10', users: 12, students: 85 },
  { id: '4', name: 'Northside Academy', email: 'admin@northside.edu', status: 'SUSPENDED', createdAt: '2023-11-05', users: 156, students: 780 },
];

export default function SuperAdminOrganizations() {
  const [searchTerm, setSearchTerm] = useState('');
  const organizations = mockOrgs;

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Organizations</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Manage all registered organizations</p>
        </div>
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:bg-zinc-800 text-sm">
          <Download size={18} />
          Export
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="p-3 md:p-4 border-b border-zinc-200">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search organizations..."
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
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase">Organization</th>
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase">Status</th>
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase hidden sm:table-cell">Created</th>
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase hidden md:table-cell">Users</th>
                <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-zinc-500 uppercase hidden md:table-cell">Students</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-zinc-50">
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Building2 size={16} className="md:w-5 md:h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900 text-sm md:text-base truncate">{org.name}</p>
                        <p className="text-[10px] md:text-sm text-zinc-500 flex items-center gap-1 hidden sm:flex">
                          <Mail size={10} className="md:w-3 md:h-3" /> {org.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-medium rounded-full ${
                      org.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      org.status === 'TRIAL' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {org.status === 'ACTIVE' ? <CheckCircle2 size={10} className="md:w-3 md:h-3" /> : <XCircle size={10} className="md:w-3 md:h-3" />}
                      <span className="hidden sm:inline">{org.status}</span>
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-zinc-600 hidden sm:table-cell">
                    {format(new Date(org.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-zinc-600 hidden md:table-cell">{org.users}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-zinc-600 hidden md:table-cell">{org.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
