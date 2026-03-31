'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  GraduationCap,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin
} from 'lucide-react';

interface ScheduleEntry {
  id: string;
  day: string;
  period: number;
  periodLabel: string;
  startTime: string;
  endTime: string;
  subject: string | null;
  classroom: {
    id: string;
    name: string;
    grade: string | null;
  } | null;
  isBreak: boolean;
}

interface Schedule {
  Monday: ScheduleEntry[];
  Tuesday: ScheduleEntry[];
  Wednesday: ScheduleEntry[];
  Thursday: ScheduleEntry[];
  Friday: ScheduleEntry[];
  Saturday: ScheduleEntry[];
}

interface Summary {
  totalPeriods: number;
  totalHours: number;
  classesCount: number;
  subjectsCount: number;
}

function TeacherScheduleContent() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false
  });

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teachers/schedule');
      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setSchedule(json.data.schedule);
          setSummary(json.data.summary);
        }
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const toggleDay = (day: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const getBreakIcon = (breakType?: string | null) => {
    if (breakType === 'lunch') return '🍽️';
    if (breakType === 'long') return '☕';
    return '⏰';
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">My Schedule</h1>
        <p className="text-zinc-500 mt-1 text-sm md:text-base">View your weekly teaching timetable</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock size={18} className="text-blue-600" />
            </div>
            <span className="text-xs text-zinc-500">Total Periods</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{summary?.totalPeriods || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap size={18} className="text-green-600" />
            </div>
            <span className="text-xs text-zinc-500">Teaching Hours</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{summary?.totalHours || 0}h</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen size={18} className="text-purple-600" />
            </div>
            <span className="text-xs text-zinc-500">Classes</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{summary?.classesCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users size={18} className="text-amber-600" />
            </div>
            <span className="text-xs text-zinc-500">Subjects</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{summary?.subjectsCount || 0}</p>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900">Weekly Timetable</h2>
        
        {days.map(day => {
          const daySchedule = schedule?.[day as keyof Schedule] || [];
          const isExpanded = expandedDays[day];
          
          return (
            <div key={day} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleDay(day)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-zinc-900">{day}</h3>
                    <p className="text-xs text-zinc-500">{daySchedule.length} {daySchedule.length === 1 ? 'period' : 'periods'}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp size={20} className="text-zinc-400" />
                ) : (
                  <ChevronDown size={20} className="text-zinc-400" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-zinc-100">
                  {daySchedule.length === 0 ? (
                    <div className="p-6 text-center text-zinc-500">
                      No classes scheduled for {day}
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100">
                      {daySchedule.map((entry) => (
                        <div 
                          key={entry.id} 
                          className={`p-4 flex items-center gap-4 ${
                            entry.isBreak ? 'bg-amber-50' : 'hover:bg-zinc-50'
                          }`}
                        >
                          <div className="w-16 text-center">
                            <p className="text-xs text-zinc-500">{entry.startTime}</p>
                            <p className="text-xs text-zinc-400">to</p>
                            <p className="text-xs text-zinc-500">{entry.endTime}</p>
                          </div>
                          
                          <div className="w-1 h-12 rounded-full bg-zinc-200" />
                          
                          <div className="flex-1">
                            {entry.isBreak ? (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{getBreakIcon()}</span>
                                <div>
                                  <p className="font-semibold text-amber-800">{entry.periodLabel}</p>
                                  <p className="text-xs text-amber-600">Break Time</p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="font-semibold text-zinc-900">{entry.subject || 'Free Period'}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                                  {entry.classroom && (
                                    <span className="flex items-center gap-1">
                                      <BookOpen size={12} />
                                      {entry.classroom.name}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    {entry.classroom?.grade || 'N/A'}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              entry.isBreak 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {entry.periodLabel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Schedule State */}
      {schedule && Object.values(schedule).every(day => day.length === 0) && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-zinc-300" />
          <h3 className="text-lg font-bold text-zinc-900 mb-2">No Schedule Found</h3>
          <p className="text-zinc-500">
            Your timetable has not been set up yet. Contact your administrator to configure your teaching schedule.
          </p>
        </div>
      )}
    </div>
  );
}

export default function TeacherSchedulePage() {
  return (
    <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
      <TeacherScheduleContent />
    </RoleGuard>
  );
}
