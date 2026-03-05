'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Mail, 
  Tag,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Users,
  Link2,
  UserPlus
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const studentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  rfid_uid: z.string().min(4, 'RFID UID is required'),
  class: z.string().optional(),
  parent_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

export default function StudentsPage() {
  const { organization, role, user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      email: '',
      rfid_uid: '',
      class: '',
      parent_id: '',
      is_active: true
    }
  });

  useEffect(() => {
    if (!organization?.id) return;

    // Fetch classrooms for the dropdown
    const classroomsRef = collection(db, 'organizations', organization.id, 'classrooms');
    const unsubClassrooms = onSnapshot(classroomsRef, (snap) => {
      setClassrooms(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch parents for the dropdown
    const parentsQuery = query(
      collection(db, 'users'),
      where('org_id', '==', organization.id),
      where('role', '==', 'parent')
    );
    const unsubParents = onSnapshot(parentsQuery, (snap) => {
      setParents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch students
    const q = query(
      collection(db, 'organizations', organization.id, 'students'),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      let studentList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentList);
    });

    return () => {
      unsubscribe();
      unsubClassrooms();
      unsubParents();
    };
  }, [organization]);

  const onSubmit = async (data: any) => {
    if (!organization?.id) return;
    try {
      await addDoc(collection(db, 'organizations', organization.id, 'students'), {
        ...data,
        created_at: new Date()
      });
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const toggleStatus = async (student: any) => {
    if (!organization?.id) return;
    const ref = doc(db, 'organizations', organization.id, 'students', student.id);
    await updateDoc(ref, { is_active: !student.is_active });
  };

  const deleteStudent = async (id: string) => {
    if (!organization?.id || !confirm('Are you sure?')) return;
    await deleteDoc(doc(db, 'organizations', organization.id, 'students', id));
  };

  const openLinkModal = (student: any) => {
    setSelectedStudent(student);
    setIsLinkModalOpen(true);
  };

  const linkParent = async (parentId: string) => {
    if (!organization?.id || !selectedStudent) return;
    const ref = doc(db, 'organizations', organization.id, 'students', selectedStudent.id);
    await updateDoc(ref, { parent_id: parentId });
    setIsLinkModalOpen(false);
    setSelectedStudent(null);
  };

  const unlinkParent = async () => {
    if (!organization?.id || !selectedStudent) return;
    const ref = doc(db, 'organizations', organization.id, 'students', selectedStudent.id);
    await updateDoc(ref, { parent_id: null });
    setIsLinkModalOpen(false);
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.rfid_uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Students</h1>
          <p className="text-zinc-500 mt-1">Manage student records and RFID assignments</p>
        </div>
        {role === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-95"
          >
            <Plus size={20} />
            Add Student
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or RFID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
            />
          </div>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 outline-none focus:ring-2 ring-zinc-100"
          >
            <option value="all">All Classes</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-200">
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Student</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Class</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">RFID UID</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Parent</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold border border-zinc-200">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{student.name}</p>
                      <p className="text-xs text-zinc-500">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {student.class}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs font-mono bg-zinc-50 px-2 py-1 rounded border border-zinc-200 text-zinc-600">
                    {student.rfid_uid}
                  </code>
                </td>
                <td className="px-6 py-4">
                  {student.parent_id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-600">
                        {parents.find(p => p.id === student.parent_id)?.name || 'Linked'}
                      </span>
                      <button
                        onClick={() => openLinkModal(student)}
                        className="text-xs text-brand-blue hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openLinkModal(student)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-colors"
                    >
                      <Link2 size={12} />
                      Link Parent
                    </button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(student)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      student.is_active 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}
                  >
                    {student.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {student.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteStudent(student.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-4">
            <div className="p-4 bg-zinc-50 rounded-full">
              <Users size={48} strokeWidth={1} />
            </div>
            <div className="text-center">
              <p className="font-bold text-zinc-900">No students found</p>
              <p className="text-sm">Try adjusting your search or add a new student.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Add New Student</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Full Name</label>
                <input 
                  {...register('name')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="e.g. John Doe"
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Email</label>
                  <input 
                    {...register('email')}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Class</label>
                  <select 
                    {...register('class')}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  >
                    <option value="">Select Class</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {errors.class && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.class.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Parent / Guardian</label>
                <select 
                  {...register('parent_id')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                >
                  <option value="">Select Parent (Optional)</option>
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>{p.name || p.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">RFID UID</label>
                <input 
                  {...register('rfid_uid')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm font-mono"
                  placeholder="e.g. 1A2B3C4D"
                />
                {errors.rfid_uid && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.rfid_uid.message}</p>}
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
                  className="flex-1 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Parent Modal */}
      {isLinkModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Link Parent</h3>
                <p className="text-sm text-zinc-500 mt-1">Link a parent/guardian to {selectedStudent.name}</p>
              </div>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {parents.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Available Parents</p>
                  {parents.map((parent) => (
                    <button
                      key={parent.id}
                      onClick={() => linkParent(parent.id)}
                      className="w-full p-4 text-left bg-zinc-50 hover:bg-brand-blue/5 border border-zinc-200 hover:border-brand-blue rounded-xl transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-900 font-bold">
                            {parent.name?.charAt(0) || parent.email?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900">{parent.name || 'Unnamed'}</p>
                            <p className="text-xs text-zinc-500">{parent.email}</p>
                          </div>
                        </div>
                        {selectedStudent.parent_id === parent.id && (
                          <CheckCircle2 size={20} className="text-brand-blue" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserPlus size={48} className="mx-auto text-zinc-300 mb-4" />
                  <p className="text-zinc-500">No parent accounts available.</p>
                  <p className="text-xs text-zinc-400 mt-1">Add parents from the Staff page first.</p>
                </div>
              )}
              
              {selectedStudent.parent_id && (
                <button
                  onClick={unlinkParent}
                  className="w-full py-3 text-red-600 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors"
                >
                  Unlink Current Parent
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
