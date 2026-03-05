'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Calendar as CalendarIcon,
  Clock,
  ArrowRightLeft,
  User,
  Cpu
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';

export default function AttendancePage() {
  const { organization } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!organization?.id) return;

    const q = query(
      collection(db, 'organizations', organization.id, 'attendance_records'),
      orderBy('scan_time', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [organization]);

 const filteredRecords = records.filter(r => 
    (r.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.device_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Attendance History</h1>
          <p className="text-zinc-500 mt-1">Review and export all scan records across your organization</p>
        </div>
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-95">
          <Download size={20} />
          Export All Records
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by student name or device..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer">
          <CalendarIcon size={18} />
          <span>Date Range: All Time</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer">
          <ArrowRightLeft size={18} />
          <span>Type: All</span>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-200">
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Student</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Scan Time</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Device</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                      <User size={16} />
                    </div>
                    <p className="text-sm font-bold text-zinc-900">{record.student_name}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Clock size={14} />
                    <span className="text-sm">
                      {record.scan_time?.toDate ? format(record.scan_time.toDate(), 'MMM d, yyyy HH:mm:ss') : 'Processing...'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    record.check_type === 'check-in' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {record.check_type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Cpu size={14} />
                    <span className="text-xs font-mono">{record.device_id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest">Verified</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredRecords.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-4">
            <History size={48} strokeWidth={1} />
            <div className="text-center">
              <p className="font-bold text-zinc-900">No records found</p>
              <p className="text-sm">Attendance data will appear here as students scan their tags.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
