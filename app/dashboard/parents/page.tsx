'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  UserPlus,
  Calendar,
  Users,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Loader2,
  Link as LinkIcon,
  Unlink
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

const parentSchema = z.object({
  parentName: z.string().min(2, 'Parent name is required'),
  parentEmail: z.string().email('Valid email required'),
  parentPhone: z.string().min(10, 'Phone number required'),
  parentAddress: z.string().min(5, 'Address required'),
  parentIdNumber: z.string().min(5, 'ID number required'),
});

const studentSchema = z.object({
  name: z.string().min(2, 'Student name required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  rfidUid: z.string().min(4, 'RFID required'),
  class: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
  studentIdNumber: z.string().optional(),
});

interface Parent {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  students: Student[];
  studentCount: number;
}

interface Student {
  id: string;
  name: string;
  rfidUid: string;
  grade?: string;
  classroom?: {
    id: string;
    name: string;
  };
  isActive: boolean;
}

interface Student {
  id: string;
  name: string;
  rfid_uid: string;
  class: string;
  parent_id: string;
}

export default function ParentRegistrationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkStudentOpen, setIsLinkStudentOpen] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]);
  const [unlinkedStudents, setUnlinkedStudents] = useState<Student[]>([]);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarStudent, setCalendarStudent] = useState<Student | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [linkSearchTerm, setLinkSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/parents/manage');
      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setParents(json.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnlinkedStudents = useCallback(async () => {
    try {
      const response = await fetch('/api/students/unlinked');
      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setUnlinkedStudents(json.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch unlinked students:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const parentForm = useForm<z.infer<typeof parentSchema>>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      parentAddress: '',
      parentIdNumber: '',
    }
  });

  const studentForm = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      email: '',
      rfidUid: '',
      class: '',
      dateOfBirth: '',
      bloodGroup: '',
      allergies: '',
      emergencyContact: '',
      studentIdNumber: '',
    }
  });

  const filteredStudents = selectedParent?.students || [];

  const onParentSubmit = async (data: z.infer<typeof parentSchema>) => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/parents/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.parentName,
          email: data.parentEmail,
        }),
      });

      if (response.ok) {
        await fetchData();
        setIsModalOpen(false);
        parentForm.reset();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add parent');
      }
    } catch (error) {
      console.error('Failed to add parent:', error);
      alert('Failed to add parent');
    } finally {
      setSubmitting(false);
    }
  };

  const onStudentSubmit = async (data: z.infer<typeof studentSchema>) => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          rfidUid: data.rfidUid,
          email: data.email || null,
          grade: data.class || null,
          guardianName: selectedParent?.name,
          guardianEmail: selectedParent?.email,
          guardianPhone: null,
          dateOfBirth: data.dateOfBirth || null,
          admissionNumber: data.studentIdNumber || null,
        }),
      });

      if (response.ok) {
        await fetchData();
        studentForm.reset();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add student');
      }
    } catch (error) {
      console.error('Failed to add student:', error);
      alert('Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkStudent = async (studentId: string) => {
    if (!selectedParent) return;
    
    try {
      setSubmitting(true);
      const response = await fetch('/api/students/unlinked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          guardianEmail: selectedParent.email,
          guardianName: selectedParent.name,
        }),
      });

      if (response.ok) {
        await fetchData();
        await fetchUnlinkedStudents();
        setIsLinkStudentOpen(false);
        setLinkSearchTerm('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to link student');
      }
    } catch (error) {
      console.error('Failed to link student:', error);
      alert('Failed to link student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlinkStudent = async (studentId: string) => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: studentId,
          guardianEmail: null,
          guardianName: null,
          guardianPhone: null,
        }),
      });

      if (response.ok) {
        await fetchData();
        await fetchUnlinkedStudents();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to unlink student');
      }
    } catch (error) {
      console.error('Failed to unlink student:', error);
      alert('Failed to unlink student');
    } finally {
      setSubmitting(false);
    }
  };

  const openCalendar = (student: any) => {
    setCalendarStudent(student);
    setIsCalendarOpen(true);
    setCurrentMonth(new Date());
  };

  const getAttendanceForDay = (date: Date) => {
    return attendanceData.find(record => 
      record.scan_time?.toDate && isSameDay(record.scan_time.toDate(), date)
    );
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-bold text-zinc-400 py-2">{day}</div>
        ))}
        {days.map((day, idx) => {
          const attendance = getAttendanceForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={idx} 
              className={`aspect-square p-1 rounded-lg text-center ${
                !isCurrentMonth ? 'bg-zinc-50 text-zinc-300' : 'bg-white'
              } ${isToday ? 'ring-2 ring-brand-blue' : ''}`}
            >
              <span className={`text-xs ${isCurrentMonth ? 'text-zinc-700' : ''}`}>
                {format(day, 'd')}
              </span>
              {attendance && isCurrentMonth && (
                <div className={`mt-1 text-[8px] font-bold px-1 py-0.5 rounded ${
                  attendance.check_type === 'check-in' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {attendance.check_type === 'check-in' ? 'IN' : 'OUT'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const filteredParents = parents.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Parent & Student Registration</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Manage parent accounts and link students with KYC records</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition-colors text-sm"
        >
          <UserPlus size={18} />
          Add Parent
        </button>
      </div>

      <div className="bg-white p-3 md:p-4 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Search parents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-3 md:gap-4">
        {filteredParents.length > 0 ? filteredParents.map((parent) => (
          <div 
            key={parent.id} 
            className={`bg-white rounded-2xl border shadow-sm transition-all ${
              selectedParent?.id === parent.id ? 'border-brand-blue ring-2 ring-brand-blue/20' : 'border-zinc-200'
            }`}
          >
            <div 
              className="p-3 md:p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setSelectedParent(selectedParent?.id === parent.id ? null : parent)}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                  {parent.name?.charAt(0) || 'P'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-zinc-900 text-sm md:text-base truncate">{parent.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><Mail size={12} /> <span className="hidden sm:inline">{parent.email}</span></span>
                    <span className="flex items-center gap-1"><Users size={12} /> {parent.studentCount || 0} student(s)</span>
                  </div>
                </div>
              </div>
              <ChevronRight className={`text-zinc-400 transition-transform shrink-0 ${selectedParent?.id === parent.id ? 'rotate-90' : ''}`} />
            </div>

            {selectedParent?.id === parent.id && (
              <div className="border-t border-zinc-100 p-3 md:p-4 bg-zinc-50/50">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <h4 className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-wider">Linked Students</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        fetchUnlinkedStudents();
                        setIsLinkStudentOpen(true);
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                    >
                      <LinkIcon size={14} /> Link Existing
                    </button>
                    <button 
                      onClick={() => studentForm.reset()}
                      className="flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
                    >
                      <Plus size={14} /> Add New
                    </button>
                  </div>
                </div>

                <div className="mb-3 md:mb-4 p-3 md:p-4 bg-white rounded-xl border border-zinc-200">
                  <h5 className="font-bold text-sm mb-2 md:mb-3">Register New Student</h5>
                  <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    <input 
                      {...studentForm.register('name')}
                      placeholder="Student Name *"
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    />
                    <input 
                      {...studentForm.register('email')}
                      placeholder="Student Email"
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    />
                    <input 
                      {...studentForm.register('rfidUid')}
                      placeholder="RFID UID *"
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-mono"
                    />
                    <input 
                      {...studentForm.register('class')}
                      placeholder="Class"
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    />
                    <input 
                      {...studentForm.register('dateOfBirth')}
                      type="date"
                      placeholder="Date of Birth"
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    />
                    <input 
                      {...studentForm.register('bloodGroup')}
                      placeholder="Blood Group (e.g. O+)"
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    />
                    <input 
                      {...studentForm.register('emergencyContact')}
                      placeholder="Emergency Contact"
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    />
                    <input 
                      {...studentForm.register('studentIdNumber')}
                      placeholder="Student ID Number"
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    />
                    <input 
                      {...studentForm.register('allergies')}
                      placeholder="Allergies/Medical Conditions"
                      className="sm:col-span-2 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    />
                    <button type="submit" className="sm:col-span-2 py-2 bg-brand-blue text-white rounded-lg font-bold text-sm">
                      Add Student
                    </button>
                  </form>
                </div>

                {filteredStudents.length > 0 ? (
                  <div className="space-y-2">
                    {filteredStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 md:p-3 bg-white rounded-xl border border-zinc-200">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold text-sm">
                            {student.name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs md:text-sm text-zinc-900 truncate">{student.name}</p>
                            <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-zinc-500">
                              <code className="bg-zinc-100 px-1 py-0.5 rounded">{student.rfidUid}</code>
                              <span className="hidden sm:inline">{student.grade || student.classroom?.name || 'No class'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openCalendar(student)}
                            className="p-1.5 md:p-2 text-brand-blue hover:bg-brand-blue/5 rounded-lg"
                            title="View Attendance Calendar"
                          >
                            <Calendar size={16} className="md:w-[18px] md:h-[18px]" />
                          </button>
                          <button 
                            onClick={() => handleUnlinkStudent(student.id)}
                            className="p-1.5 md:p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Unlink Student"
                          >
                            <Unlink size={16} className="md:w-[18px] md:h-[18px]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8 text-zinc-400">
                    <Users size={28} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No students linked yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )) : (
          <div className="bg-white rounded-2xl border border-dashed border-zinc-200 p-8 md:p-12 text-center">
            <UserPlus size={40} className="mx-auto text-zinc-300 mb-4" />
            <p className="text-zinc-500">No parents found. Add a parent to get started.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Add New Parent</h3>
                <p className="text-sm text-zinc-500">Enter parent KYC details</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={parentForm.handleSubmit(onParentSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Full Name *</label>
                <input 
                  {...parentForm.register('parentName')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="e.g. John Smith"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Email *</label>
                  <input 
                    {...parentForm.register('parentEmail')}
                    type="email"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                    placeholder="parent@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Phone *</label>
                  <input 
                    {...parentForm.register('parentPhone')}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                    placeholder="+2348012345678"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Address *</label>
                <input 
                  {...parentForm.register('parentAddress')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="Full residential address"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">ID Number (NIN/Voter&apos;s Card) *</label>
                <input 
                  {...parentForm.register('parentIdNumber')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="Government issued ID number"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-50 text-zinc-600 font-bold rounded-xl hover:bg-zinc-100 transition-colors border border-zinc-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 transition-all"
                >
                  Save Parent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCalendarOpen && calendarStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Attendance Calendar</h3>
                <p className="text-sm text-zinc-500">{calendarStudent.name} - {calendarStudent.class}</p>
              </div>
              <button onClick={() => setIsCalendarOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-zinc-100 rounded-lg"
                >
                  <ChevronLeft size={20} />
                </button>
                <h4 className="font-bold text-zinc-900">{format(currentMonth, 'MMMM yyyy')}</h4>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-zinc-100 rounded-lg"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              {renderCalendar()}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-100 rounded"></div>
                  <span className="text-zinc-500">Check-in</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-100 rounded"></div>
                  <span className="text-zinc-500">Check-out</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLinkStudentOpen && selectedParent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Link Existing Student</h3>
                <p className="text-sm text-zinc-500">Link a student to {selectedParent.name}</p>
              </div>
              <button onClick={() => setIsLinkStudentOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search students..."
                    value={linkSearchTerm}
                    onChange={(e) => setLinkSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {unlinkedStudents
                  .filter(s => s.name.toLowerCase().includes(linkSearchTerm.toLowerCase()) || s.rfidUid.includes(linkSearchTerm))
                  .map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-900">{student.name}</p>
                          <p className="text-xs text-zinc-500">
                            <code className="bg-zinc-200 px-1 py-0.5 rounded">{student.rfidUid}</code>
                            {' '}{student.grade || student.classroom?.name || 'No class'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleLinkStudent(student.id)}
                        disabled={submitting}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Link'}
                      </button>
                    </div>
                  ))}
                {unlinkedStudents.length === 0 && (
                  <div className="text-center py-8 text-zinc-400">
                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No unlinked students found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
