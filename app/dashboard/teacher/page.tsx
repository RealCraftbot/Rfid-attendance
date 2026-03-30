'use client';

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, TrendingUp, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type DashboardData = {
  assignedClassrooms: Array<{
    id: string;
    name: string;
    section: string | null;
    grade: string | null;
    studentCount: number;
  }>;
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
  recentActivity: Array<{
    id: string;
    studentName: string;
    scanTime: string;
    checkType: string;
  }>;
};

export default function TeacherDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teachers/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load data');
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-zinc-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Default values if no data
  const stats = data || {
    assignedClassrooms: [],
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
    recentActivity: []
  };

  const className = stats.assignedClassrooms.length > 0 
    ? stats.assignedClassrooms[0].name 
    : 'No Class Assigned';

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Teacher Dashboard</h1>
        <p className="text-zinc-500 mt-1 text-sm md:text-base">{className} - Today&apos;s Overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
              <Users size={16} className="md:w-5 md:h-5 text-blue-600" />
            </div>
            <span className="text-xs md:text-sm text-zinc-500">Total Students</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-zinc-900">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="p-1.5 md:p-2 bg-green-100 rounded-lg">
              <CheckCircle2 size={16} className="md:w-5 md:h-5 text-green-600" />
            </div>
            <span className="text-xs md:text-sm text-zinc-500">Present</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-green-600">{stats.presentToday}</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="p-1.5 md:p-2 bg-red-100 rounded-lg">
              <AlertCircle size={16} className="md:w-5 md:h-5 text-red-600" />
            </div>
            <span className="text-xs md:text-sm text-zinc-500">Absent</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-red-600">{stats.absentToday}</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg">
              <TrendingUp size={16} className="md:w-5 md:h-5 text-purple-600" />
            </div>
            <span className="text-xs md:text-sm text-zinc-500">Attendance Rate</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-purple-600">{stats.attendanceRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Clock size={18} className="md:w-5 md:h-5 text-zinc-400" />
            <h2 className="text-base md:text-lg font-bold text-zinc-900">Recent Check-ins</h2>
          </div>
          <div className="space-y-2 md:space-y-3">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-7 md:w-8 h-7 md:h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs md:text-sm font-bold text-zinc-600">
                      {activity.studentName?.charAt(0) || '?'}
                    </div>
                    <span className="font-medium text-zinc-900 text-sm md:text-base">{activity.studentName}</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4">
                    <span className="text-xs md:text-sm text-zinc-500">
                      {activity.scanTime ? format(new Date(activity.scanTime), 'HH:mm') : '--:--'}
                    </span>
                    <span className="px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      {activity.checkType === 'check_in' ? 'In' : 'Out'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-400">
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <BookOpen size={18} className="md:w-5 md:h-5 text-zinc-400" />
            <h2 className="text-base md:text-lg font-bold text-zinc-900">My Classes</h2>
          </div>
          <div className="space-y-2 md:space-y-3">
            {stats.assignedClassrooms && stats.assignedClassrooms.length > 0 ? (
              stats.assignedClassrooms.map((classroom) => (
                <div key={classroom.id} className="flex items-center justify-between p-2 md:p-3 bg-zinc-50 rounded-lg">
                  <div>
                    <p className="font-medium text-zinc-900 text-sm md:text-base">{classroom.name}</p>
                    {classroom.section && (
                      <p className="text-xs md:text-sm text-zinc-500">Section: {classroom.section}</p>
                    )}
                  </div>
                  <span className="text-xs md:text-sm font-medium text-zinc-600">{classroom.studentCount} students</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-400">
                <p className="text-sm">No classes assigned</p>
                <p className="text-xs mt-1">Contact admin to assign classrooms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}