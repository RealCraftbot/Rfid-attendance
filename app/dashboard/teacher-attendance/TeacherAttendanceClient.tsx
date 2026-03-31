'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Clock, 
  Calendar,
  ChevronRight,
  Search,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  MapPin,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface TeacherAttendanceRecord {
  id: string;
  teacherName: string;
  classroomName: string;
  checkType: 'check_in' | 'check_out';
  scanTime: string;
  deviceId: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject?: string;
  rfidUid?: string;
}

export default function TeacherAttendanceClient() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/teachers/attendance?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
        setAttendanceRecords(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch teacher attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch = record.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.classroomName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeacher = selectedTeacher ? record.teacherName === teachers.find(t => t.id === selectedTeacher)?.name : true;
    return matchesSearch && matchesTeacher;
  });

  // Group records by teacher
  const recordsByTeacher = new Map<string, TeacherAttendanceRecord[]>();
  filteredRecords.forEach((record) => {
    if (!recordsByTeacher.has(record.teacherName)) {
      recordsByTeacher.set(record.teacherName, []);
    }
    recordsByTeacher.get(record.teacherName)?.push(record);
  });

  // Calculate stats for each teacher
  const getTeacherStats = (teacherName: string) => {
    const teacherRecords = recordsByTeacher.get(teacherName) || [];
    const checkIns = teacherRecords.filter((r) => r.checkType === 'check_in');
    const checkOuts = teacherRecords.filter((r) => r.checkType === 'check_out');
    
    // Calculate total hours (mock calculation)
    let totalHours = 0;
    for (let i = 0; i < checkIns.length; i++) {
      const checkIn = new Date(checkIns[i].scanTime);
      const checkOut = checkOuts[i] ? new Date(checkOuts[i].scanTime) : null;
      if (checkOut) {
        totalHours += (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      }
    }

    return {
      totalClasses: checkIns.length,
      completedClasses: checkOuts.length,
      totalHours: Math.round(totalHours * 10) / 10,
    };
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <Link
            href="/dashboard/attendance"
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-600" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">Teacher Attendance</h1>
            <p className="text-zinc-500 mt-0.5 text-xs sm:text-sm">Track teacher classroom attendance via RFID</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-3 py-2">
          <Calendar size={16} className="text-zinc-400" />
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="text-sm border-none outline-none"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-blue-600" />
            <span className="text-[10px] sm:text-xs text-blue-600 font-medium">Total Teachers</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-blue-900">{teachers.length}</p>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} className="text-green-600" />
            <span className="text-[10px] sm:text-xs text-green-600 font-medium">Checked In</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-green-900">
            {new Set(filteredRecords.filter(r => r.checkType === 'check_in').map(r => r.teacherName)).size}
          </p>
        </div>
        <div className="bg-purple-50 p-3 sm:p-4 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={14} className="text-purple-600" />
            <span className="text-[10px] sm:text-xs text-purple-600 font-medium">Classes Today</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-purple-900">{filteredRecords.filter(r => r.checkType === 'check_in').length}</p>
        </div>
        <div className="bg-amber-50 p-3 sm:p-4 rounded-xl border border-amber-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-amber-600" />
            <span className="text-[10px] sm:text-xs text-amber-600 font-medium">Avg Hours</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-amber-900">6.5h</p>
        </div>
      </div>

      {/* Teacher Filter & Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search teacher or classroom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={selectedTeacher || ''}
            onChange={(e) => setSelectedTeacher(e.target.value || null)}
            className="px-3 py-2 border border-zinc-200 rounded-lg text-xs sm:text-sm bg-white"
          >
            <option value="">All Teachers</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Teacher Cards */}
      <div className="space-y-4">
        {Array.from(recordsByTeacher.entries()).map(([teacherName, records]) => {
          const stats = getTeacherStats(teacherName);
          const teacher = teachers.find(t => t.name === teacherName);
          
          return (
            <div key={teacherName} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              {/* Teacher Header */}
              <div className="p-3 sm:p-4 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm sm:text-base">
                    {teacherName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-sm sm:text-base">{teacherName}</h3>
                    <p className="text-xs text-zinc-500">{teacher?.subject || 'Teacher'}</p>
                  </div>
                </div>
                <div className="flex gap-3 text-xs sm:text-sm">
                  <div className="text-center">
                    <p className="text-zinc-500">Classes</p>
                    <p className="font-bold text-zinc-900">{stats.totalClasses}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-500">Hours</p>
                    <p className="font-bold text-zinc-900">{stats.totalHours}h</p>
                  </div>
                </div>
              </div>

              {/* Attendance Records */}
              <div className="divide-y divide-zinc-100">
                {records.map((record) => (
                  <div key={record.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-zinc-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        record.checkType === 'check_in' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {record.checkType === 'check_in' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 text-xs sm:text-sm">{record.classroomName}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-500 flex items-center gap-1">
                          <MapPin size={10} />
                          {record.deviceId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        record.checkType === 'check_in' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {record.checkType === 'check_in' ? 'Check In' : 'Check Out'}
                      </span>
                      <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">
                        {format(new Date(record.scanTime), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-zinc-200">
          <Users size={40} className="mx-auto mb-3 text-zinc-300" />
          <p className="text-zinc-500 text-sm">No teacher attendance records found</p>
        </div>
      )}
    </div>
  );
}
