'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Types
interface TimetableEntry {
  id: string;
  orgId: string;
  day: string;
  period: number;
  subject: string;
  teacherId: string;
  classroomId: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

interface Classroom {
  id: string;
  name: string;
  grade: string;
}

interface TimetableProps {
  orgId: string;
  orgName: string;
}

// API fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Mock data for teachers and classrooms
const mockTeachers: Teacher[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', imageUrl: '/placeholder.svg?height=40&width=40' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', imageUrl: '/placeholder.svg?height=40&width=40' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', imageUrl: '/placeholder.svg?height=40&width=40' },
];

const mockClassrooms: Classroom[] = [
  { id: '1', name: '101', grade: 'SS1' },
  { id: '2', name: '102', grade: 'SS2' },
  { id: '3', name: '103', grade: 'SS3' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const periods = [1, 2, 3, 4, 5, 6, 7];

const TimetableEditor: React.FC<TimetableProps> = ({ orgId, orgName }) => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [classrooms, setClassrooms] = useState<Classroom[]>(mockClassrooms);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch timetable data
  const { data: fetchedTimetable, mutate } = useSWR(
    `/api/timetable?orgId=${orgId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Fetch teachers and classrooms
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [teachersRes, classroomsRes] = await Promise.all([
          fetch('/api/teachers?orgId=' + orgId).then(res => res.json()),
          fetch('/api/classrooms?orgId=' + orgId).then(res => res.json()),
        ]);
        
        if (teachersRes.success) {
          setTeachers(teachersRes.data);
        }
        
        if (classroomsRes.success) {
          setClassrooms(classroomsRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch resources:', err);
      }
    };
    
    if (orgId) {
      fetchResources();
    }
  }, [orgId]);

  // Update local timetable when fetched data changes
  useEffect(() => {
    if (fetchedTimetable?.success) {
      setTimetable(fetchedTimetable.data);
    }
  }, [fetchedTimetable]);

  // Find timetable entry by day and period
  const getEntry = (day: string, period: number) => {
    return timetable.find(t => t.day === day && t.period === period);
  };

  // Update entry
  const updateEntry = (day: string, period: number, field: string, value: string) => {
    setTimetable(prev => {
      return prev.map(entry => {
        if (entry.day === day && entry.period === period) {
          return { ...entry, [field]: value };
        }
        return entry;
      });
    });
  };

  // Save timetable
  const saveTimetable = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/timetable', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId,
          entries: timetable,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await mutate();
        toast({
          title: 'Success',
          description: 'Timetable saved successfully',
          variant: 'default',
        });
      } else {
        setError(result.error || 'Failed to save timetable');
      }
    } catch (err) {
      setError('Failed to save timetable. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete entry
  const deleteEntry = async (day: string, period: number) => {
    const entry = getEntry(day, period);
    if (!entry) return;
    
    try {
      const response = await fetch(`/api/timetable?id=${entry.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTimetable(prev => prev.filter(e => !(e.day === day && e.period === period)));
        toast({
          title: 'Success',
          description: 'Timetable entry deleted',
          variant: 'default',
        });
      } else {
        setError(result.error || 'Failed to delete timetable entry');
      }
    } catch (err) {
      setError('Failed to delete timetable entry. Please try again.');
      console.error('Delete error:', err);
    }
  };

  // Get teacher name by ID
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown';
  };

  // Get classroom name by ID
  const getClassroomName = (classroomId: string) => {
    const classroom = classrooms.find(c => c.id === classroomId);
    return classroom ? classroom.name : 'Unknown';
  };

  // Get teacher presence status
  const getTeacherPresence = (teacherId: string) => {
    // In a real app, this would check actual presence
    return Math.random() > 0.3; // 70% chance of being present
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Timetable for {orgName}</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Present</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Absent</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Period/Day
                </th>
                {days.map(day => (
                  <th key={day} className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map(period => (
                <tr key={period} className="border-b border-gray-200">
                  <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
                    {period}
                  </td>
                  {days.map(day => {
                    const entry = getEntry(day, period);
                    const teacher = entry ? getTeacherName(entry.teacherId) : '';
                    const classroom = entry ? getClassroomName(entry.classroomId) : '';
                    const isPresent = entry ? getTeacherPresence(entry.teacherId) : false;
                    
                    return (
                      <td
                        key={`${day}-${period}`}
                        className={cn(
                          "border border-gray-300 p-2 text-center text-sm",
                          entry ? "bg-blue-50" : "bg-gray-50"
                        )}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          {entry ? (
                            <>
                              <div className="flex items-center justify-center space-x-1">
                                <span className="font-medium">{entry.subject}</span>
                                <span className="text-xs text-gray-500">{entry.startTime}-{entry.endTime}</span>
                              </div>
                              <div className="flex items-center justify-center space-x-1">
                                <span className="text-xs text-gray-600">{teacher}</span>
                                <div className={cn(
                                  "h-2 w-2 rounded-full",
                                  isPresent ? "bg-green-500" : "bg-red-500"
                                )}></div>
                              </div>
                              <div className="text-xs text-gray-500">{classroom}</div>
                              <div className="flex items-center space-x-1">
                                <select
                                  value={entry.teacherId}
                                  onChange={e => updateEntry(day, period, 'teacherId', e.target.value)}
                                  className="text-xs border rounded px-1 py-0.5"
                                >
                                  {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                                </select>
                                <select
                                  value={entry.classroomId}
                                  onChange={e => updateEntry(day, period, 'classroomId', e.target.value)}
                                  className="text-xs border rounded px-1 py-0.5"
                                >
                                  {classrooms.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              </div>
                              <button
                                onClick={() => deleteEntry(day, period)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <div className="text-xs text-gray-500">
                              <button
                                onClick={() => {
                                  setTimetable(prev => [
                                    ...prev,
                                    {
                                      id: `new-${day}-${period}`,
                                      orgId,
                                      day,
                                      period,
                                      subject: '',
                                      teacherId: teachers[0]?.id || '',
                                      classroomId: classrooms[0]?.id || '',
                                      startTime: '08:00',
                                      endTime: '09:00',
                                      createdAt: new Date().toISOString(),
                                      updatedAt: new Date().toISOString(),
                                    }
                                  ]);
                                }}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={saveTimetable}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Timetable'}
        </button>
      </div>
    </div>
  );
};

export default TimetableEditor;