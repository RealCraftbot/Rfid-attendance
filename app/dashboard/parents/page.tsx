'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  UserPlus,
  Calendar,
  CheckCircle2,
  XCircle,
  Users,
  Phone,
  Mail,
  Home,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle
} from 'lucide-react';
import { collection, onSnapshot, query, where, addDoc, doc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
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
  rfid_uid: z.string().min(4, 'RFID required'),
  class: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
  studentIdNumber: z.string().optional(),
});

export default function ParentRegistrationPage() {
  const { organization, role } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parents, setParents] = useState<any[]>([]);
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarStudent, setCalendarStudent] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
      rfid_uid: '',
      class: '',
      dateOfBirth: '',
      bloodGroup: '',
      allergies: '',
      emergencyContact: '',
      studentIdNumber: '',
    }
  });

  useEffect(() => {
    if (!organization?.id) return;

    const q = query(
      collection(db, 'users'),
      where('org_id', '==', organization.id),
      where('role', '==', 'parent')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setParents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [organization]);

  useEffect(() => {
    if (!organization?.id || !selectedParent) return;

    const q = query(
      collection(db, 'organizations', organization.id, 'students'),
      where('parent_id', '==', selectedParent.id)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [organization, selectedParent]);

  useEffect(() => {
    if (!organization?.id || !calendarStudent) return;

    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const q = query(
      collection(db, 'organizations', organization.id, 'attendance_records'),
      where('student_id', '==', calendarStudent.id)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setAttendanceData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [organization, calendarStudent, currentMonth]);

  const onParentSubmit = async (data: z.infer<typeof parentSchema>) => {
    if (!organization?.id) return;
    try {
      await addDoc(collection(db, 'users'), {
        name: data.parentName,
        email: data.parentEmail,
        phone: data.parentPhone,
        address: data.parentAddress,
        idNumber: data.parentIdNumber,
        org_id: organization.id,
        role: 'parent',
        is_active: true,
        created_at: new Date(),
      });
      setIsModalOpen(false);
      parentForm.reset();
    } catch (error) {
      console.error('Error adding parent:', error);
    }
  };

  const onStudentSubmit = async (data: z.infer<typeof studentSchema>) => {
    if (!organization?.id || !selectedParent) return;
    try {
      await addDoc(collection(db, 'organizations', organization.id, 'students'), {
        ...data,
        parent_id: selectedParent.id,
        is_active: true,
        created_at: new Date(),
      });
      studentForm.reset();
    } catch (error) {
      console.error('Error adding student:', error);
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
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  if (role !== 'admin' && role !== 'teacher') {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-zinc-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Parent & Student Registration</h1>
          <p className="text-zinc-500 mt-1">Manage parent accounts and link students with KYC records</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition-colors"
        >
          <UserPlus size={18} />
          Add Parent
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Search parents by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
          />
        </div>
      </div>

      {/* Parents List */}
      <div className="grid gap-4">
        {filteredParents.length > 0 ? filteredParents.map((parent) => (
          <div 
            key={parent.id} 
            className={`bg-white rounded-2xl border shadow-sm transition-all ${
              selectedParent?.id === parent.id ? 'border-brand-blue ring-2 ring-brand-blue/20' : 'border-zinc-200'
            }`}
          >
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setSelectedParent(selectedParent?.id === parent.id ? null : parent)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                  {parent.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">{parent.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><Mail size={12} /> {parent.email}</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {parent.phone}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className={`text-zinc-400 transition-transform ${selectedParent?.id === parent.id ? 'rotate-90' : ''}`} />
            </div>

            {/* Expanded Student List */}
            {selectedParent?.id === parent.id && (
              <div className="border-t border-zinc-100 p-4 bg-zinc-50/50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Linked Students</h4>
                  <button 
                    onClick={() => studentForm.reset()}
                    className="flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
                  >
                    <Plus size={14} /> Add Student
                  </button>
                </div>

                {/* Add Student Form */}
                <div className="mb-4 p-4 bg-white rounded-xl border border-zinc-200">
                  <h5 className="font-bold text-sm mb-3">Register New Student</h5>
                  <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      {...studentForm.register('rfid_uid')}
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
                      className="md:col-span-2 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    />
                    <button type="submit" className="md:col-span-2 py-2 bg-brand-blue text-white rounded-lg font-bold text-sm">
                      Add Student
                    </button>
                  </form>
                </div>

                {/* Students */}
                {students.length > 0 ? (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
                            {student.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-zinc-900">{student.name}</p>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                              <code className="bg-zinc-100 px-1.5 py-0.5 rounded">{student.rfid_uid}</code>
                              <span>{student.class || 'No class'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openCalendar(student)}
                            className="p-2 text-brand-blue hover:bg-brand-blue/5 rounded-lg"
                            title="View Attendance Calendar"
                          >
                            <Calendar size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-400">
                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No students linked yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )) : (
          <div className="bg-white rounded-2xl border border-dashed border-zinc-200 p-12 text-center">
            <UserPlus size={48} className="mx-auto text-zinc-300 mb-4" />
            <p className="text-zinc-500">No parents found. Add a parent to get started.</p>
          </div>
        )}
      </div>

      {/* Add Parent Modal */}
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
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">ID Number (NIN/Voter's Card) *</label>
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

      {/* Calendar Modal */}
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
    </div>
  );
}
