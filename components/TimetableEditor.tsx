'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Edit2, Trash2, Save, Clock, User, DoorOpen, 
  Settings, X, Coffee, Utensils, Check, ChevronDown, ChevronUp
} from 'lucide-react';

interface TimetableEntry {
  id: string;
  orgId: string;
  day: string;
  period: number;
  subject: string;
  teacherId: string;
  teacherName?: string;
  classroomId: string;
  classroomName?: string;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
  breakType?: 'short' | 'long' | 'lunch';
  createdAt: string;
  updatedAt: string;
}

interface Period {
  id: string;
  period: number;
  label: string;
  startTime: string;
  endTime: string;
  duration: number;
  isBreak: boolean;
  breakType?: 'short' | 'long' | 'lunch';
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

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.error?.message || json.error || json.message || 'Failed to fetch';
    throw new Error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
  }
  return json.data || [];
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultPeriods: Period[] = [
  { id: '1', period: 1, label: '1st Period', startTime: '08:00', endTime: '08:40', duration: 40, isBreak: false },
  { id: '2', period: 2, label: '2nd Period', startTime: '08:40', endTime: '09:20', duration: 40, isBreak: false },
  { id: '2.5', period: 2.5, label: 'Short Break', startTime: '09:20', endTime: '09:40', duration: 20, isBreak: true, breakType: 'short' },
  { id: '3', period: 3, label: '3rd Period', startTime: '09:40', endTime: '10:20', duration: 40, isBreak: false },
  { id: '4', period: 4, label: '4th Period', startTime: '10:20', endTime: '11:00', duration: 40, isBreak: false },
  { id: '4.5', period: 4.5, label: 'Long Break', startTime: '11:00', endTime: '11:30', duration: 30, isBreak: true, breakType: 'long' },
  { id: '5', period: 5, label: '5th Period', startTime: '11:30', endTime: '12:10', duration: 40, isBreak: false },
  { id: '6', period: 6, label: '6th Period', startTime: '12:10', endTime: '12:50', duration: 40, isBreak: false },
  { id: '6.5', period: 6.5, label: 'Lunch Break', startTime: '12:50', endTime: '13:30', duration: 40, isBreak: true, breakType: 'lunch' },
  { id: '7', period: 7, label: '7th Period', startTime: '13:30', endTime: '14:10', duration: 40, isBreak: false },
  { id: '8', period: 8, label: '8th Period', startTime: '14:10', endTime: '14:50', duration: 40, isBreak: false },
];

const TimetableEditor: React.FC<TimetableProps> = ({ orgId, orgName }) => {
  const [periods, setPeriods] = useState<Period[]>(defaultPeriods);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: string; period: Period } | null>(null);
  const { toast } = useToast();

  const { data: fetchedTimetable, mutate } = useSWR<TimetableEntry[]>(
    `/api/timetable?orgId=${orgId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (err) => {
        setError(err.message || 'Failed to load timetable');
        setIsLoading(false);
      },
      onSuccess: () => setIsLoading(false)
    }
  );

  useEffect(() => {
    if (fetchedTimetable) {
      setTimetable(fetchedTimetable);
      setError(null);
    }
  }, [fetchedTimetable]);

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

  const getEntry = useCallback((day: string, period: number) => {
    return timetable.find(t => t.day === day && t.period === period);
  }, [timetable]);

  const saveEntry = async (entryData: Partial<TimetableEntry>) => {
    if (!selectedCell) return;

    setIsSaving(true);
    setError(null);

    const existingEntry = getEntry(selectedCell.day, selectedCell.period.period);
    
    try {
      const url = '/api/timetable';
      const method = existingEntry ? 'PUT' : 'POST';
      const body = existingEntry 
        ? { ...entryData, id: existingEntry.id, orgId, day: selectedCell.day, period: selectedCell.period.period }
        : { ...entryData, orgId, day: selectedCell.day, period: selectedCell.period.period };

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
        toast({ title: 'Error', description: result.error || 'Failed to save', variant: 'destructive' });
      }
    } catch (err) {
      setError('Failed to save. Please try again.');
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (day: string, period: number) => {
    const entry = getEntry(day, period);
    if (!entry) return;

    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/timetable?id=${entry.id}`, { method: 'DELETE' });
      const result = await response.json();

      if (result.success) {
        await mutate();
        toast({ title: 'Success', description: 'Entry deleted' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const openModal = (day: string, period: Period) => {
    setSelectedCell({ day, period });
    setModalOpen(true);
  };

  const addPeriod = () => {
    const newPeriod = {
      id: Date.now().toString(),
      period: periods.length + 1,
      label: `${periods.length + 1}th Period`,
      startTime: '14:50',
      endTime: '15:30',
      duration: 40,
      isBreak: false
    };
    setPeriods([...periods, newPeriod]);
  };

  const removePeriod = (id: string) => {
    if (periods.length <= 1) {
      toast({ title: 'Error', description: 'Must have at least one period', variant: 'destructive' });
      return;
    }
    setPeriods(periods.filter(p => p.id !== id));
  };

  const updatePeriod = (id: string, updates: Partial<Period>) => {
    setPeriods(periods.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addBreak = () => {
    const lastPeriod = periods[periods.length - 1];
    const newBreak = {
      id: (Date.now() + 1).toString(),
      period: lastPeriod.period + 0.5,
      label: 'Break',
      startTime: lastPeriod.endTime,
      endTime: calculateEndTime(lastPeriod.endTime, 30),
      duration: 30,
      isBreak: true,
      breakType: 'short' as const
    };
    const newPeriods = [...periods];
    const insertIndex = periods.findIndex(p => p.period > newBreak.period);
    if (insertIndex === -1) {
      newPeriods.push(newBreak);
    } else {
      newPeriods.splice(insertIndex, 0, newBreak);
    }
    setPeriods(newPeriods);
  };

  const calculateEndTime = (start: string, minutes: number): string => {
    const [h, m] = start.split(':').map(Number);
    const totalMins = h * 60 + m + minutes;
    return `${Math.floor(totalMins / 60).toString().padStart(2, '0')}:${(totalMins % 60).toString().padStart(2, '0')}`;
  };

  const selectedPeriodInfo = selectedCell?.period;
  const selectedEntry = selectedCell ? getEntry(selectedCell.day, selectedCell.period.period) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">School Timetable</h2>
          <p className="text-sm text-gray-500 mt-1">{orgName}</p>
        </div>
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configure Periods & Breaks
        </button>
      </div>

      {settingsOpen && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Period & Break Configuration</h3>
            <div className="flex gap-2">
              <button
                onClick={addPeriod}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Period
              </button>
              <button
                onClick={addBreak}
                className="px-3 py-1.5 text-sm bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 flex items-center gap-1"
              >
                <Coffee className="w-4 h-4" /> Add Break
              </button>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {periods.sort((a, b) => a.period - b.period).map((period) => (
              <div key={period.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={period.label}
                    onChange={(e) => updatePeriod(period.id, { label: e.target.value })}
                    className="px-2 py-1.5 border border-gray-200 rounded text-sm"
                    placeholder="Period name"
                  />
                  <input
                    type="time"
                    value={period.startTime}
                    onChange={(e) => updatePeriod(period.id, { startTime: e.target.value })}
                    className="px-2 py-1.5 border border-gray-200 rounded text-sm"
                  />
                  <input
                    type="time"
                    value={period.endTime}
                    onChange={(e) => updatePeriod(period.id, { endTime: e.target.value })}
                    className="px-2 py-1.5 border border-gray-200 rounded text-sm"
                  />
                  <select
                    value={period.breakType || 'class'}
                    onChange={(e) => {
                      const isBreak = e.target.value !== 'class';
                      updatePeriod(period.id, { 
                        isBreak,
                        breakType: isBreak ? e.target.value as 'short' | 'long' | 'lunch' : undefined
                      });
                    }}
                    className="px-2 py-1.5 border border-gray-200 rounded text-sm"
                  >
                    <option value="class">Class Period</option>
                    <option value="short">Short Break</option>
                    <option value="long">Long Break</option>
                    <option value="lunch">Lunch Break</option>
                  </select>
                </div>
                <button
                  onClick={() => removePeriod(period.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading timetable...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{String(error)}</p>
        </div>
      )}

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
                  {days.map(day => (
                    <th key={day} className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[160px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.sort((a, b) => a.period - b.period).map((periodInfo) => (
                  <tr key={periodInfo.id} className={periodInfo.isBreak ? 'bg-amber-50' : ''}>
                    <td className={cn(
                      "border border-gray-300 px-4 py-3 text-sm",
                      periodInfo.isBreak ? "bg-amber-100 font-semibold text-amber-800" : "font-medium text-gray-700"
                    )}>
                      <div className="flex flex-col">
                        <span>{periodInfo.label}</span>
                        <span className="text-xs text-gray-500">
                          {periodInfo.startTime} - {periodInfo.endTime}
                        </span>
                        <span className="text-xs text-gray-400">{periodInfo.duration} mins</span>
                      </div>
                    </td>

                    {days.map(day => {
                      const entry = getEntry(day, periodInfo.period);
                      
                      if (periodInfo.isBreak) {
                        return (
                          <td key={`${day}-${periodInfo.id}`} className="border border-gray-300 p-4 text-center bg-amber-50">
                            <div className="flex flex-col items-center justify-center h-full">
                              <span className="text-lg">
                                {periodInfo.breakType === 'short' ? '☕' : periodInfo.breakType === 'lunch' ? '🍽️' : '🧘'}
                              </span>
                              <span className="text-sm font-semibold text-amber-800 mt-1">{periodInfo.label}</span>
                            </div>
                          </td>
                        );
                      }

                      const teacher = entry ? teachers.find(t => t.id === entry.teacherId) : null;
                      const classroom = entry ? classrooms.find(c => c.id === entry.classroomId) : null;

                      return (
                        <td
                          key={`${day}-${periodInfo.id}`}
                          className={cn(
                            "border border-gray-300 p-2 min-h-[100px] cursor-pointer transition-all hover:shadow-md",
                            entry ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                          )}
                          onClick={() => openModal(day, periodInfo)}
                        >
                          {entry ? (
                            <div className="flex flex-col h-full relative group">
                              <div className="flex items-start justify-between">
                                <span className="font-semibold text-gray-900 text-sm">{entry.subject}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openModal(day, periodInfo); }}
                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteEntry(day, periodInfo.period); }}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                                <User className="w-3 h-3" />
                                <span className="truncate">{teacher?.name || entry.teacherName || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <DoorOpen className="w-3 h-3" />
                                <span>{classroom?.name || entry.classroomName || 'Unknown'}</span>
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
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<TimetableEntry>) => void;
  entry?: TimetableEntry | null;
  day: string;
  periodInfo: Period;
  teachers: Teacher[];
  classrooms: Classroom[];
  isSaving: boolean;
}

const EntryModal: React.FC<EntryModalProps> = ({
  isOpen, onClose, onSave, entry, day, periodInfo, teachers, classrooms, isSaving
}) => {
  const [subject, setSubject] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [classroomId, setClassroomId] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubject(entry?.subject ?? '');
    setTeacherId(entry?.teacherId ?? '');
    setClassroomId(entry?.classroomId ?? '');
  }, [entry]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{entry ? 'Edit' : 'Add'} Timetable Entry</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">{day} • {periodInfo.label}</p>
          <p className="text-xs text-blue-700">{periodInfo.startTime} - {periodInfo.endTime}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics, English, Physics"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classroom *</label>
            <select
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a classroom</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name} {classroom.grade && `(${classroom.grade})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({
                subject,
                teacherId,
                classroomId,
                startTime: periodInfo.startTime,
                endTime: periodInfo.endTime,
              });
              onClose();
            }}
            disabled={!subject || !teacherId || !classroomId || isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <><Check className="w-4 h-4" /> Save Entry</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimetableEditor;
