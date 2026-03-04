'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Users, 
  User, 
  MoreVertical, 
  Trash2, 
  Edit2,
  ChevronRight
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
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';

export default function ClassroomsPage() {
  const { organization, role } = useAuth();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    teacher_id: '',
    teacher_name: '',
    description: ''
  });

  useEffect(() => {
    if (!organization?.id) return;

    // 1. Fetch Classrooms
    const classroomsRef = collection(db, 'organizations', organization.id, 'classrooms');
    const unsubClassrooms = onSnapshot(classroomsRef, (snap) => {
      const classes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClassrooms(classes);
      setLoading(false);
    });

    // 2. Fetch Teachers (users with role 'teacher' in this org)
    const fetchTeachers = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('org_id', '==', organization.id), where('role', '==', 'teacher'));
      const snap = await getDocs(q);
      setTeachers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchTeachers();

    return () => unsubClassrooms();
  }, [organization]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    try {
      const classroomsRef = collection(db, 'organizations', organization.id, 'classrooms');
      const selectedTeacher = teachers.find(t => t.id === formData.teacher_id);
      
      await addDoc(classroomsRef, {
        ...formData,
        teacher_name: selectedTeacher?.displayName || 'Unassigned',
        student_count: 0,
        created_at: new Date()
      });

      setIsModalOpen(false);
      setFormData({ name: '', teacher_id: '', teacher_name: '', description: '' });
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

  const filteredClasses = classrooms.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Classrooms</h1>
          <p className="text-zinc-500 mt-1">Manage school classes, assign teachers, and monitor student distribution.</p>
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
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Avg Students</p>
            <p className="text-xl font-bold text-zinc-900">
              {classrooms.length > 0 
                ? Math.round(classrooms.reduce((acc, curr) => acc + (curr.student_count || 0), 0) / classrooms.length) 
                : 0}
            </p>
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
            
            <button className="w-full py-4 bg-zinc-50 border-t border-zinc-100 text-brand-blue text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-blue hover:text-white transition-all">
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
          {role === 'admin' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-6 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold"
            >
              Add Classroom
            </button>
          )}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">New Classroom</h2>
              <p className="text-zinc-500 text-sm mb-8">Create a new class and assign a teacher to manage it.</p>
              
              <form onSubmit={handleCreateClass} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Class Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Primary 4A"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-brand-blue/20 text-zinc-900"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Assign Teacher</label>
                  <select 
                    required
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-brand-blue/20 text-zinc-900"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.displayName}</option>
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
