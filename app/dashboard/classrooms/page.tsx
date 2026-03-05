'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Users, 
  User, 
  Trash2, 
  Edit2,
  ChevronRight,
  X,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  FileText,
  Award,
  AlertCircle
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  deleteDoc,
  doc, 
  updateDoc,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { format, startOfWeek, endOfWeek, isSameDay } from 'date-fns';

export default function ClassroomsPage() {
  const { organization, role } = useAuth();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [weekAttendance, setWeekAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    teacher_id: '',
    teacher_name: '',
    description: ''
  });

  useEffect(() => {
    if (!organization?.id) return;

    const classroomsRef = collection(db, 'organizations', organization.id, 'classrooms');
    const unsubClassrooms = onSnapshot(classroomsRef, (snap) => {
      const classes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClassrooms(classes);
      setLoading(false);
    });

    const fetchTeachers = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('org_id', '==', organization.id), where('role', '==', 'teacher'));
      const snap = await getDocs(q);
      setTeachers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchTeachers();
    return () => unsubClassrooms();
  }, [organization]);

  useEffect(() => {
    if (!organization?.id || !selectedClass) return;

    const studentsRef = collection(db, 'organizations', organization.id, 'students');
    const q = query(studentsRef, where('class', '==', selectedClass.name));
    
    const unsub = onSnapshot(q, (snap) => {
      setClassStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [organization, selectedClass]);

  useEffect(() => {
    if (!organization?.id || !selectedClass) return;

    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const attendanceRef = collection(db, 'organizations', organization.id, 'attendance_records');
    const q = query(
      attendanceRef,
      where('scan_time', '>=', weekStart),
      orderBy('scan_time', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const records = snap.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter(r => classStudents.some(s => s.id === r.student_id));
      setWeekAttendance(records);
    });

    return () => unsub();
  }, [organization, selectedClass, classStudents]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    try {
      const classroomsRef = collection(db, 'organizations', organization.id, 'classrooms');
      const selectedTeacher = teachers.find(t => t.id === formData.teacher_id);
      
      await addDoc(classroomsRef, {
        ...formData,
        teacher_name: selectedTeacher?.name || 'Unassigned',
        student_count: 0,
        created_at: new Date()
      });

      setIsModalOpen(false);
      setFormData({ name: '', section: '', teacher_id: '', teacher_name: '', description: '' });
    } catch (error) {
      console.error('Error creating classroom:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!organization?.id || !confirm('Are you sure you want to delete this classroom?')) return;
    try {
      await deleteDoc(doc(db, 'organizations', organization.id, 'classrooms', id));
    } catch (error) {
      console.error('Error deleting classroom:', error);
    }
  };

  const getWeekStats = () => {
    const present = weekAttendance.filter(r => r.check_type === 'check-in').length;
    const total = classStudents.length * 5; // 5 school days
    return { present, total: Math.min(total, weekAttendance.length), rate: total > 0 ? Math.round((present / total) * 100) : 0 };
  };

  const filteredClasses = classrooms.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = getWeekStats();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Classrooms</h1>
          <p className="text-zinc-500 mt-1">Manage school classes, view student details, and monitor attendance.</p>
        </div>
        {role === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20 active:scale-95"
          >
            <Plus size={20} />
            New Classroom
          </button>
        )}
      </div>

      {/* Search & Stats */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by class name or teacher..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
          />
        </div>
        <div className="flex items-center gap-6 px-4">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Total Classes</p>
            <p className="text-xl font-bold text-zinc-900">{classrooms.length}</p>
          </div>
          <div className="w-[1px] h-8 bg-zinc-100" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Total Students</p>
            <p className="text-xl font-bold text-zinc-900">{classrooms.reduce((acc, c) => acc + (c.student_count || 0), 0)}</p>
          </div>
        </div>
      </div>

      {/* Class Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classroom) => (
          <div key={classroom.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue">
                  <BookOpen size={24} />
                </div>
                {role === 'admin' && (
                  <button onClick={() => handleDelete(classroom.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-zinc-900 mb-1">{classroom.name}</h3>
              {classroom.section && <p className="text-xs text-brand-purple font-bold mb-2">Section: {classroom.section}</p>}
              <p className="text-sm text-zinc-500 line-clamp-2 mb-6">{classroom.description || 'No description provided.'}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <User size={16} className="text-zinc-400" />
                    <span>Teacher</span>
                  </div>
                  <span className="font-bold text-zinc-900">{classroom.teacher_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Users size={16} className="text-zinc-400" />
                    <span>Students</span>
                  </div>
                  <span className="font-bold text-zinc-900">{classroom.student_count || 0}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedClass(classroom)}
              className="w-full py-4 bg-zinc-50 border-t border-zinc-100 text-brand-blue text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-blue hover:text-white transition-all"
            >
              View Class Details
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredClasses.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-4 bg-white rounded-3xl border border-dashed border-zinc-200">
          <BookOpen size={64} strokeWidth={1} />
          <div className="text-center">
            <p className="text-lg font-bold text-zinc-900">No classrooms found</p>
            <p className="text-sm">Start by creating your first classroom and assigning a teacher.</p>
          </div>
        </div>
      )}

      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-start sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900">{selectedClass.name}</h2>
                    {selectedClass.section && <p className="text-sm text-brand-purple font-bold">Section: {selectedClass.section}</p>}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedClass(null)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X size={24} className="text-zinc-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* Class Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Users size={16} />
                    <span className="text-xs font-bold uppercase">Total Students</span>
                  </div>
                  <p className="text-2xl font-bold text-zinc-900">{classStudents.length}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold uppercase">Present This Week</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{stats.present}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2 text-red-600 mb-1">
                    <XCircle size={16} />
                    <span className="text-xs font-bold uppercase">Absent</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{Math.max(0, classStudents.length * 5 - stats.present)}</p>
                </div>
                <div className="bg-brand-blue/10 p-4 rounded-xl border border-brand-blue/20">
                  <div className="flex items-center gap-2 text-brand-blue mb-1">
                    <TrendingUp size={16} />
                    <span className="text-xs font-bold uppercase">Attendance Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-brand-blue">{stats.rate}%</p>
                </div>
              </div>

              {/* Teacher Info */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 mb-6">
                <h3 className="font-bold text-zinc-900 mb-3 flex items-center gap-2">
                  <User size={18} /> Class Teacher
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-lg">
                    {selectedClass.teacher_name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">{selectedClass.teacher_name || 'Not Assigned'}</p>
                    <p className="text-sm text-zinc-500">Class Teacher</p>
                  </div>
                </div>
              </div>

              {/* Student List */}
              <div>
                <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <FileText size={18} /> Student Roster ({classStudents.length})
                </h3>
                {classStudents.length > 0 ? (
                  <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase">Admission No.</th>
                          <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase">Student Name</th>
                          <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase">RFID</th>
                          <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {classStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-zinc-50">
                            <td className="px-4 py-3 text-sm font-mono text-zinc-600">{student.studentIdNumber || '-'}</td>
                            <td className="px-4 py-3 text-sm font-bold text-zinc-900">{student.name}</td>
                            <td className="px-4 py-3 text-sm font-mono text-zinc-500">{student.rfid_uid}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                student.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                              }`}>
                                {student.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-400">
                    <Users size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No students in this class</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">New Classroom</h2>
              <p className="text-zinc-500 text-sm mb-8">Create a new class and assign a teacher.</p>
              
              <form onSubmit={handleCreateClass} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Class Name *</label>
                  <select 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-brand-blue/20 text-zinc-900"
                  >
                    <option value="">Select Class</option>
                    <optgroup label="Primary">
                      <option value="Primary 1">Primary 1</option>
                      <option value="Primary 2">Primary 2</option>
                      <option value="Primary 3">Primary 3</option>
                      <option value="Primary 4">Primary 4</option>
                      <option value="Primary 5">Primary 5</option>
                      <option value="Primary 6">Primary 6</option>
                    </optgroup>
                    <optgroup label="Junior Secondary (JSS)">
                      <option value="JSS 1">JSS 1</option>
                      <option value="JSS 2">JSS 2</option>
                      <option value="JSS 3">JSS 3</option>
                    </optgroup>
                    <optgroup label="Senior Secondary (SSS)">
                      <option value="SSS 1">SSS 1</option>
                      <option value="SSS 2">SSS 2</option>
                      <option value="SSS 3">SSS 3</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Section/Arm</label>
                  <select 
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-brand-blue/20 text-zinc-900"
                  >
                    <option value="">General (No Section)</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="Science">Science</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Assign Teacher</label>
                  <select 
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-brand-blue/20 text-zinc-900"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name || t.email}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Briefly describe the class..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-brand-blue/20 text-zinc-900 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
                  >
                    Create Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}