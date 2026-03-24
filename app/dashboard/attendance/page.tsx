'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { 
  Search, 
  Download, 
  Calendar, 
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Table,
  Clock,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

// Types
interface AttendanceRecord {
  studentId: string;
  studentName: string;
  className: string;
  status: 'present' | 'absent' | 'late' | 'on-site' | 'checked-out';
  checkInTime: string | null;
  checkOutTime: string | null;
  deviceId: string | null;
  durationOnSite: number | null;
  totalScans: number;
}

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  onSite: number;
  checkedOut: number;
}

// Validation schema for search
const searchSchema = z.object({
  query: z.string().min(1).max(100),
});

// Mock data - would be fetched from API
const mockAttendanceData: AttendanceRecord[] = [
  {
    studentId: 's1',
    studentName: 'Chukwuemeka Okafor',
    className: 'Primary 5',
    status: 'checked-out',
    checkInTime: '2025-12-15T07:45:00Z',
    checkOutTime: '2025-12-15T14:30:00Z',
    deviceId: 'main-gate',
    durationOnSite: 405,
    totalScans: 2,
  },
  {
    studentId: 's2',
    studentName: 'Adaeze Nwosu',
    className: 'Primary 5',
    status: 'on-site',
    checkInTime: '2025-12-15T08:15:00Z',
    checkOutTime: null,
    deviceId: 'main-gate',
    durationOnSite: null,
    totalScans: 1,
  },
  {
    studentId: 's3',
    studentName: 'Oluwaseun Adebayo',
    className: 'JSS 2',
    status: 'late',
    checkInTime: '2025-12-15T08:45:00Z',
    checkOutTime: null,
    deviceId: 'side-entrance',
    durationOnSite: null,
    totalScans: 1,
  },
  {
    studentId: 's4',
    studentName: 'Fatima Ibrahim',
    className: 'Primary 3',
    status: 'absent',
    checkInTime: null,
    checkOutTime: null,
    deviceId: null,
    durationOnSite: null,
    totalScans: 0,
  },
  {
    studentId: 's5',
    studentName: 'Emmanuel Chidi',
    className: 'JSS 1',
    status: 'checked-out',
    checkInTime: '2025-12-15T07:30:00Z',
    checkOutTime: '2025-12-15T13:45:00Z',
    deviceId: 'main-gate',
    durationOnSite: 375,
    totalScans: 2,
  },
];

const mockStats: AttendanceStats = {
  total: 45,
  present: 42,
  absent: 2,
  late: 1,
  onSite: 15,
  checkedOut: 26,
};

export default function AttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'on-site' | 'checked-out'>('all');
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(mockAttendanceData);
  const [isExporting, setIsExporting] = useState(false);

  // Initialize from URL params
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const searchParam = searchParams.get('search');
    const statusParam = searchParams.get('status') as typeof statusFilter;

    if (dateParam) {
      setSelectedDate(new Date(dateParam));
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  // Filter records based on search and status
  useEffect(() => {
    let filtered = mockAttendanceData;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    // Apply search filter with Zod validation
    if (searchQuery.trim()) {
      const validation = searchSchema.safeParse({ query: searchQuery.trim() });
      if (validation.success) {
        setSearchError(null);
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (record) =>
            record.studentName.toLowerCase().includes(query) ||
            record.className.toLowerCase().includes(query) ||
            (record.deviceId && record.deviceId.toLowerCase().includes(query))
        );
      } else {
        setSearchError('Search must be 1-100 characters');
      }
    } else {
      setSearchError(null);
    }

    setFilteredRecords(filtered);
  }, [searchQuery, statusFilter]);

  // Update URL params
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle date change
  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    updateUrlParams({ date: newDate.toISOString().split('T')[0] });
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    updateUrlParams({ search: value || null });
  };

  // Handle status filter
  const handleStatusFilter = (status: typeof statusFilter) => {
    setStatusFilter(status);
    updateUrlParams({ status: status === 'all' ? null : status });
  };

  // Export functions
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/attendance/export?format=pdf&date=' + selectedDate.toISOString());
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${format(selectedDate, 'yyyy-MM-dd')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/attendance/export?format=csv&date=' + selectedDate.toISOString());
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Format duration
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get status color
  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
      case 'checked-out':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'on-site':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'late':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'absent':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  // Get status label
  const getStatusLabel = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'on-site':
        return 'On Site';
      case 'checked-out':
        return 'Checked Out';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">Attendance History</h1>
          <p className="text-zinc-500 mt-1 text-xs sm:text-sm">Review and export all scan records</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 text-xs sm:text-sm font-medium disabled:opacity-50"
          >
            <Table size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-xs sm:text-sm font-medium disabled:opacity-50"
          >
            <FileText size={14} className="sm:w-4 sm:h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Clock size={14} className="text-blue-600" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Total</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-zinc-900">{mockStats.total}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <UserCheck size={14} className="text-green-600" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Present</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-green-600">{mockStats.present}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <UserCheck size={14} className="text-emerald-600" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">On Site</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-emerald-600">{mockStats.onSite}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-zinc-100 rounded-lg">
              <Clock size={14} className="text-zinc-600" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Checked Out</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-zinc-600">{mockStats.checkedOut}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <AlertCircle size={14} className="text-amber-600" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Late</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-amber-600">{mockStats.late}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <UserX size={14} className="text-red-600" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Absent</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-red-600">{mockStats.absent}</p>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleDateChange(-1)}
              className="p-2 hover:bg-zinc-100 rounded-lg"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-lg">
              <Calendar size={16} className="text-zinc-500" />
              <span className="font-medium text-sm">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <button 
              onClick={() => handleDateChange(1)}
              className="p-2 hover:bg-zinc-100 rounded-lg"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={() => {
              setSelectedDate(new Date());
              updateUrlParams({ date: new Date().toISOString().split('T')[0] });
            }}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Today
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by student name, class, or device..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 border border-zinc-200 rounded-lg text-xs sm:text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="on-site">On Site</option>
              <option value="checked-out">Checked Out</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>

        {searchError && (
          <div className="flex items-center gap-2 text-red-600 text-xs">
            <AlertCircle size={14} />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider">Student</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider">In Time</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider">Out Time</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider">Device</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 sm:py-12 text-center text-zinc-500">
                    <Clock size={32} className="mx-auto mb-3 text-zinc-300" />
                    <p className="text-xs sm:text-sm">No attendance records found</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.studentId} className="hover:bg-zinc-50">
                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs sm:text-sm">
                          {record.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 text-xs sm:text-sm">{record.studentName}</p>
                          <p className="text-[10px] sm:text-xs text-zinc-500">{record.className}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${getStatusColor(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-zinc-600">
                      {record.checkInTime ? format(new Date(record.checkInTime), 'HH:mm') : '-'}
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-zinc-600">
                      {record.checkOutTime ? format(new Date(record.checkOutTime), 'HH:mm') : '-'}
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-zinc-600">
                      {record.deviceId || '-'}
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-zinc-600 font-medium">
                      {formatDuration(record.durationOnSite)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
