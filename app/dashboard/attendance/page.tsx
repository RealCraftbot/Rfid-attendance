'use client';

import { useState } from 'react';
import { History, Search, Download, Clock } from 'lucide-react';
import { format } from 'date-fns';

const mockRecords = [
  { id: '1', studentName: 'John Doe', checkType: 'check_in', scanTime: new Date().toISOString(), deviceId: 'main-gate' },
  { id: '2', studentName: 'Jane Smith', checkType: 'check_out', scanTime: new Date().toISOString(), deviceId: 'main-gate' },
  { id: '3', studentName: 'Michael Johnson', checkType: 'check_in', scanTime: new Date().toISOString(), deviceId: 'side-entrance' },
  { id: '4', studentName: 'Emily Davis', checkType: 'check_in', scanTime: new Date().toISOString(), deviceId: 'main-gate' },
  { id: '5', studentName: 'Robert Wilson', checkType: 'check_out', scanTime: new Date().toISOString(), deviceId: 'side-entrance' },
];

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const records = mockRecords;

  const filteredRecords = records.filter(r =>
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Attendance History</h1>
          <p className="text-zinc-500 mt-1">Review and export all scan records</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800">
          <Download size={18} />
          Export
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="p-4 border-b border-zinc-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search by student or device..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-zinc-600">{record.studentName.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-zinc-900">{record.studentName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                      record.checkType === 'check_in' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {record.checkType === 'check_in' ? 'Check In' : 'Check Out'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">{record.deviceId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {format(new Date(record.scanTime), 'MMM d, yyyy HH:mm')}
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
