'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2,
  CheckCircle2,
  XCircle,
  Users,
  Link2,
  UserPlus,
  XCircle as XCircleIcon,
  Camera,
  Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

const studentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  rfidUid: z.string().min(4, 'RFID UID is required'),
  grade: z.string().optional(),
  classroomId: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email('Invalid email').optional().nullable(),
  dateOfBirth: z.string().optional(),
  isActive: z.boolean().default(true),
  usesSchoolBus: z.boolean().default(false),
});

type Student = {
  id: string;
  name: string;
  email: string | null;
  rfidUid: string;
  grade: string | null;
  classroomId: string | null;
  classroom: { id: string; name: string; grade: string | null } | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
  admissionNumber: string | null;
  dateOfBirth: string | null;
  isActive: boolean;
  imageUrl: string | null;
  usesSchoolBus: boolean;
};

type Classroom = {
  id: string;
  name: string;
  grade: string | null;
};

type Parent = {
  id: string;
  name: string;
  email: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      rfidUid: '',
      grade: '',
      classroomId: '',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      dateOfBirth: '',
      isActive: true,
      usesSchoolBus: false,
    }
  });

  // Fetch all data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch students
      const studentsRes = await fetch('/api/students');
      const studentsData = await studentsRes.json();
      if (studentsData.success) {
        setStudents(studentsData.data);
      }

      // Fetch classrooms
      const classroomsRes = await fetch('/api/classrooms');
      const classroomsData = await classroomsRes.json();
      if (classroomsData.success) {
        setClassrooms(classroomsData.data);
      }

      // Fetch parents
      const parentsRes = await fetch('/api/parents');
      const parentsData = await parentsRes.json();
      if (parentsData.success) {
        setParents(parentsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof studentSchema>) => {
    try {
      const url = isEditMode && selectedStudent ? `/api/students?id=${selectedStudent.id}` : '/api/students';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: isEditMode ? 'Student updated successfully' : 'Student added successfully',
        });
        if (isEditMode) {
          setStudents(students.map(s => s.id === selectedStudent?.id ? result.data : s));
        } else {
          setStudents([...students, result.data]);
        }
        setIsModalOpen(false);
        setIsEditMode(false);
        setSelectedStudent(null);
        reset();
      } else {
        toast({
          title: 'Error',
          description: result.error || `Failed to ${isEditMode ? 'update' : 'add'} student`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'add'} student`,
        variant: 'destructive',
      });
    }
  };

  const toggleStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...student, isActive: !currentStatus }),
      });

      const result = await response.json();

      if (result.success) {
        setStudents(students.map(s => 
          s.id === studentId ? { ...s, isActive: !currentStatus } : s
        ));
        toast({
          title: 'Success',
          description: `Student ${!currentStatus ? 'activated' : 'deactivated'}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const deleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setStudents(students.filter(s => s.id !== id));
        toast({
          title: 'Success',
          description: 'Student deleted',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = async (studentId: string, file: File) => {
    setUploadingImage(studentId);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'student');
      formData.append('studentId', studentId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Update student with new image URL
        const student = students.find(s => s.id === studentId);
        if (student) {
          const updateRes = await fetch('/api/students', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...student, imageUrl: data.url }),
          });

          if (updateRes.ok) {
            setStudents(students.map(s => 
              s.id === studentId ? { ...s, imageUrl: data.url } : s
            ));
            toast({
              title: 'Success',
              description: 'Image uploaded successfully',
            });
          }
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to upload image',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(null);
    }
  };

  const openLinkModal = (student: Student) => {
    setSelectedStudent(student);
    setIsLinkModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setIsEditMode(true);
    setValue('name', student.name);
    setValue('rfidUid', student.rfidUid);
    setValue('grade', student.grade || '');
    setValue('classroomId', student.classroomId || '');
    setValue('guardianName', student.guardianName || '');
    setValue('guardianPhone', student.guardianPhone || '');
    setValue('guardianEmail', student.guardianEmail || '');
    setValue('dateOfBirth', student.dateOfBirth || '');
    setValue('isActive', student.isActive);
    setValue('usesSchoolBus', student.usesSchoolBus);
    setIsModalOpen(true);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.rfidUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.classroomId === selectedClass;
    return matchesSearch && matchesClass;
  });

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-zinc-500">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Students</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Manage student records and RFID assignments</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-95 text-sm"
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      <div className="bg-white p-3 md:p-4 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, RFID, or admission number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
            />
          </div>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 md:px-4 py-2 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 outline-none focus:ring-2 ring-zinc-100"
          >
            <option value="all">All Classrooms</option>
            {classrooms.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => {
            const csv = [
              ['Name', 'Email', 'RFID UID', 'Class', 'Admission Number', 'Status'].join(','),
              ...filteredStudents.map(s => [
                s.name,
                s.email || '',
                s.rfidUid,
                s.classroom?.name || s.grade || '',
                s.admissionNumber || '',
                s.isActive ? 'Active' : 'Inactive'
              ].join(','))
            ].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50"
        >
          <Download size={18} />
          Export
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-200">
                <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest">Student</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest">Class</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:table-cell">RFID UID</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest hidden md:table-cell">Parent</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      {student.imageUrl ? (
                        <img src={student.imageUrl} alt={student.name} className="w-8 md:w-10 h-8 md:h-10 rounded-full object-cover border-2 border-zinc-200" />
                      ) : (
                        <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs md:text-sm font-bold border-2 border-blue-200">
                          {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate">{student.name}</p>
                        <p className="text-[10px] md:text-xs text-zinc-500 hidden sm:block">{student.admissionNumber || student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {student.classroom?.name || student.grade || 'N/A'}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                    <code className="text-[10px] md:text-xs font-mono bg-zinc-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded border border-zinc-200 text-zinc-600">
                      {student.rfidUid}
                    </code>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                    {student.guardianName ? (
                      <span className="text-xs font-medium text-zinc-600">
                        {student.guardianName}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">Not linked</span>
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <button 
                      onClick={() => toggleStatus(student.id, student.isActive)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border ${
                        student.isActive 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}
                    >
                      {student.isActive ? <CheckCircle2 size={10} className="md:w-3 md:h-3" /> : <XCircle size={10} className="md:w-3 md:h-3" />}
                      {student.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                    <div className="flex items-center justify-end gap-1 md:gap-2">
                      <label className="p-1.5 md:p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer relative" title="Upload Photo">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(student.id, file);
                          }}
                        />
                        {uploadingImage === student.id ? (
                          <Loader2 size={14} className="md:w-4 md:h-4 animate-spin" />
                        ) : (
                          <Camera size={14} className="md:w-4 md:h-4" />
                        )}
                      </label>
                      <button 
                        onClick={() => openEditModal(student)}
                        className="p-1.5 md:p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} className="md:w-4 md:h-4" />
                      </button>
                      <button 
                        onClick={() => deleteStudent(student.id)}
                        className="p-1.5 md:p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle size={14} className="md:w-4 md:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <div className="py-16 md:py-20 flex flex-col items-center justify-center text-zinc-400 space-y-4">
            <div className="p-4 bg-zinc-50 rounded-full">
              <Users size={40} className="md:w-12 md:h-12" strokeWidth={1} />
            </div>
            <div className="text-center">
              <p className="font-bold text-zinc-900">No students found</p>
              <p className="text-sm">Try adjusting your search or add a new student.</p>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">{isEditMode ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={() => { setIsModalOpen(false); setIsEditMode(false); setSelectedStudent(null); }} className="text-zinc-400 hover:text-zinc-900">
                <XCircleIcon size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Full Name *</label>
                <input 
                  {...register('name')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="e.g. John Doe"
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Classroom</label>
                <select 
                  {...register('classroomId')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                >
                  <option value="">Select Classroom</option>
                  {classrooms.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">RFID UID *</label>
                <input 
                  {...register('rfidUid')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm font-mono"
                  placeholder="e.g. 1A2B3C4D"
                />
                {errors.rfidUid && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.rfidUid.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Parent/Guardian Name</label>
                <input 
                  {...register('guardianName')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="e.g. Mr. John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Parent Phone</label>
                  <input 
                    {...register('guardianPhone')}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                    placeholder="+234..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Parent Email</label>
                  <input 
                    {...register('guardianEmail')}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                    placeholder="parent@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Date of Birth</label>
                <input 
                  type="date"
                  {...register('dateOfBirth')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('usesSchoolBus')}
                  className="w-4 h-4 rounded border-zinc-300"
                />
                <label className="text-sm text-zinc-600">Uses School Bus</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setIsModalOpen(false); setIsEditMode(false); setSelectedStudent(null); }}
                  className="flex-1 py-3 bg-zinc-50 text-zinc-600 font-bold rounded-xl hover:bg-zinc-100 transition-colors border border-zinc-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}