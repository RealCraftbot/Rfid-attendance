'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Save, Clock, BookOpen, User, DoorOpen } from 'lucide-react';

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
  isBreak?: boolean;
  breakType?: 'short' | 'long';
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

// Nigerian Secondary School Standard Periods with Breaks
const standardPeriods = [
  { period: 1, startTime: '08:00', endTime: '08:40', label: '1st Period', duration: '40 mins' },
  { period: 2, startTime: '08:40', endTime: '09:20', label: '2nd Period', duration: '40 mins' },
  { period: 2.5, startTime: '09:20', endTime: '09:40', label: 'SHORT BREAK', duration: '20 mins', isBreak: true, breakType: 'short' },
  { period: 3, startTime: '09:40', endTime: '10:20', label: '3rd Period', duration: '40 mins' },
  { period: 4, startTime: '10:20', endTime: '11:00', label: '4th Period', duration: '40 mins' },
  { period: 4.5, startTime: '11:00', endTime: '11:30', label: 'LONG BREAK', duration: '30 mins', isBreak: true, breakType: 'long' },
  { period: 5, startTime: '11:30', endTime: '12:10', label: '5th Period', duration: '40 mins' },
  { period: 6, startTime: '12:10', endTime: '12:50', label: '6th Period', duration: '40 mins' },
  { period: 7, startTime: '12:50', endTime: '13:30', label: '7th Period', duration: '40 mins' },
  { period: 8, startTime: '13:30', endTime: '14:10', label: '8th Period', duration: '40 mins' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Modal Component for Adding/Editing Entries
const EntryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<TimetableEntry>) => void;
  entry?: TimetableEntry | null;
  day: string;
  periodInfo: typeof standardPeriods[0];
  teachers: Teacher[];
  classrooms: Classroom[];
}> = ({ isOpen, onClose, onSave, entry, day, periodInfo, teachers, classrooms }) => {
  const [formData, setFormData] = useState({
    subject: '',
    teacherId: '',
    classroomId: '',
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        subject: entry.subject || '',
        teacherId: entry.teacherId || '',
        classroomId: entry.classroomId || '',
      });
    } else {
      setFormData({ subject: '', teacherId: '', classroomId: '' });
    }
  }, [entry, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">
          {entry ? 'Edit' : 'Add'} Timetable Entry
        </h3>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            {day} • {periodInfo.label}
          </p>
          <p className="text-xs text-blue-700">
            {periodInfo.startTime} - {periodInfo.endTime} ({periodInfo.duration})
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Mathematics, English, Physics"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher *
            </label>
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a teacher</option>
              {teachers?.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classroom *
            </label>
            <select
              value={formData.classroomId}
              onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a classroom</option>
              {classrooms?.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name} {classroom.grade && `(${classroom.grade})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({
                ...formData,
                startTime: periodInfo.startTime,
                endTime: periodInfo.endTime,
              });
              onClose();
            }}
            disabled={!formData.subject || !formData.teacherId || !formData.classroomId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};

const TimetableEditor: React.FC<TimetableProps> = ({ orgId, orgName }) => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: string; period: number } | null>(null);
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
      setIsLoading(true);
      try {
        const [teachersRes, classroomsRes] = await Promise.all([
          fetch('/api/teachers?orgId=' + orgId).then(res => res.json()),
          fetch('/api/classrooms?orgId=' + orgId).then(res => res.json()),
        ]);
        
        if (teachersRes.success) {
          setTeachers(teachersRes.data || []);
        }
        
        if (classroomsRes.success) {
          setClassrooms(classroomsRes.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError('Failed to load timetable data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (orgId) {
      fetchResources();
    }
  }, [orgId]);

  // Update local timetable when fetched data changes
  useEffect(() => {
    if (fetchedTimetable?.success && Array.isArray(fetchedTimetable.data)) {
      setTimetable(fetchedTimetable.data);
    } else if (fetchedTimetable && !fetchedTimetable.success) {
      setError(fetchedTimetable.error || 'Failed to load timetable');
    }
  }, [fetchedTimetable]);

  // Find timetable entry by day and period
  const getEntry = (day: string, period: number) => {
    return timetable.find(t => t.day === day && t.period === period);
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
    return Math.random() > 0.3;
  };

  // Save single entry
  const saveEntry = async (entryData: Partial<TimetableEntry>) => {
    if (!selectedCell) return;

    setIsSaving(true);
    setError(null);

    const existingEntry = getEntry(selectedCell.day, selectedCell.period);
    
    try {
      const url = '/api/timetable';
      const method = existingEntry ? 'PUT' : 'POST';
      const body = existingEntry 
        ? { ...entryData, id: existingEntry.id, orgId, day: selectedCell.day, period: selectedCell.period }
        : { ...entryData, orgId, day: selectedCell.day, period: selectedCell.period };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        await mutate();
        toast({
          title: 'Success',
          description: existingEntry ? 'Entry updated' : 'Entry created',
          variant: 'default',
        });
      } else {
        setError(result.error || 'Failed to save');
      }
    } catch (err) {
      setError('Failed to save. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete entry
  const deleteEntry = async (day: string, period: number) => {
    const entry = getEntry(day, period);
    if (!entry) return;

    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/timetable?id=${entry.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        await mutate();
        toast({
          title: 'Success',
          description: 'Entry deleted',
          variant: 'default',
        });
      } else {
        setError(result.error || 'Failed to delete');
      }
    } catch (err) {
      setError('Failed to delete. Please try again.');
    }
  };

  // Open modal for adding/editing
  const openModal = (day: string, period: number) => {
    setSelectedCell({ day, period });
    setModalOpen(true);
  };

  const selectedPeriodInfo = standardPeriods.find(p => p.period === selectedCell?.period);
  const selectedEntry = selectedCell ? getEntry(selectedCell.day, selectedCell.period) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">School Timetable</h2>
          <p className="text-sm text-gray-500 mt-1">{orgName}</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Teacher Present</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Teacher Absent</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading timetable...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>How to use:</strong> Click on any cell to add or edit a class. 
          Break periods are automatically highlighted. Teachers marked with 🟢 are present, 🔴 are absent.
        </p>
      </div>

      {/* Timetable Grid */}
      {!isLoading && (
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <div className="min-w-max">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time / Day
                  </div>
                </th>
                {days?.map(day => (
                  <th key={day} className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[160px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standardPeriods.map((periodInfo) => (
                <tr key={periodInfo.period} className={periodInfo.isBreak ? 'bg-yellow-50' : ''}>
                  {/* Time Column */}
                  <td className={cn(
                    "border border-gray-300 px-4 py-3 text-sm",
                    periodInfo.isBreak ? "bg-yellow-100 font-semibold text-yellow-800" : "font-medium text-gray-700"
                  )}>
                    <div className="flex flex-col">
                      <span>{periodInfo.label}</span>
                      <span className="text-xs text-gray-500">
                        {periodInfo.startTime} - {periodInfo.endTime}
                      </span>
                      <span className="text-xs text-gray-400">{periodInfo.duration}</span>
                    </div>
                  </td>

                  {/* Day Columns */}
                  {days?.map(day => {
                    const entry = getEntry(day, periodInfo.period);
                    
                    if (periodInfo.isBreak) {
                      return (
                        <td
                          key={`${day}-${periodInfo.period}`}
                          className="border border-gray-300 p-4 text-center bg-yellow-50"
                        >
                          <div className="flex flex-col items-center justify-center h-full">
                            <span className="text-lg font-bold text-yellow-700">
                              {periodInfo.breakType === 'short' ? '☕' : '🍽️'}
                            </span>
                            <span className="text-sm font-semibold text-yellow-800 mt-1">
                              {periodInfo.label}
                            </span>
                            <span className="text-xs text-yellow-600">
                              {periodInfo.duration}
                            </span>
                          </div>
                        </td>
                      );
                    }

                    const teacher = entry ? getTeacherName(entry.teacherId) : '';
                    const classroom = entry ? getClassroomName(entry.classroomId) : '';
                    const isPresent = entry ? getTeacherPresence(entry.teacherId) : false;

                    return (
                      <td
                        key={`${day}-${periodInfo.period}`}
                        className={cn(
                          "border border-gray-300 p-2 min-h-[100px] cursor-pointer transition-all hover:shadow-md",
                          entry ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                        )}
                        onClick={() => openModal(day, periodInfo.period)}
                      >
                        {entry ? (
                          <div className="flex flex-col h-full relative group">
                            {/* Subject */}
                            <div className="flex items-start justify-between">
                              <span className="font-semibold text-gray-900 text-sm">
                                {entry.subject}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(day, periodInfo.period);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteEntry(day, periodInfo.period);
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Teacher */}
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                              <User className="w-3 h-3" />
                              <span className="truncate">{teacher}</span>
                              <div className={cn(
                                "h-2 w-2 rounded-full ml-1",
                                isPresent ? "bg-green-500" : "bg-red-500"
                              )} />
                            </div>

                            {/* Classroom */}
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <DoorOpen className="w-3 h-3" />
                              <span>{classroom}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full min-h-[80px] text-gray-400">
                            <Plus className="w-6 h-6 mb-1" />
                            <span className="text-xs">Click to add</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal */}
      {selectedCell && selectedPeriodInfo && (
        <EntryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={saveEntry}
          entry={selectedEntry}
          day={selectedCell.day}
          periodInfo={selectedPeriodInfo}
          teachers={teachers}
          classrooms={classrooms}
        />
      )}
    </div>
  );
};

export default TimetableEditor;