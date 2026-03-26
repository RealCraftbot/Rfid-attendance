'use client';


import React, { useState, useRef } from 'react';
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
  Upload,
  Camera
} from 'lucide-react';
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

const NIGERIAN_CLASSES = [
  'Nursery 1', 'Nursery 2', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SS 1', 'SS 2', 'SS 3'
];

const mockClassrooms = NIGERIAN_CLASSES.map((name, i) => ({ id: String(i + 1), name }));

const mockParents = [
  { id: 'p1', name: 'Mrs. Adebayo', email: 'adebayo@email.com' },
  { id: 'p2', name: 'Mr. Okonkwo', email: 'okonkwo@email.com' },
  { id: 'p3', name: 'Mrs. Nnamdi', email: 'nnamdi@email.com' },
];

const mockStudents: Array<{
  id: string;
  name: string;
  email: string;
  rfid_uid: string;
  class: string;
  parent_id: string | null;
  is_active: boolean;
  imageUrl?: string;
  admissionNo?: string;
}> = [
  { id: 's1', name: 'Adebayo Oluwaseun', email: 'adebayo.j@student.com', rfid_uid: '1A2B3C4D', class: 'Primary 1', parent_id: 'p1', is_active: true, admissionNo: 'GA/2023/001' },
  { id: 's2', name: 'Chukwu Adaobi', email: 'adaobi.c@student.com', rfid_uid: '5E6F7G8H', class: 'Primary 1', parent_id: 'p1', is_active: true, admissionNo: 'GA/2023/002' },
  { id: 's3', name: 'Okonkwo Chibueze', email: 'chibueze.o@student.com', rfid_uid: '9I0J1K2L', class: 'Primary 2', parent_id: 'p2', is_active: true, admissionNo: 'GA/2022/015' },
  { id: 's4', name: 'Nnamdi Somtochi', email: 'somtochi.n@student.com', rfid_uid: '3M4N5O6P', class: 'JSS 1', parent_id: 'p3', is_active: true, admissionNo: 'GA/2021/008' },
  { id: 's5', name: 'Eze Ifeoma', email: 'ifeoma.e@student.com', rfid_uid: '7Q8R9S0T', class: 'SS 2', parent_id: 'p3', is_active: false, admissionNo: 'GA/2020/023' },
];

let studentCounter = 10;
const nextStudentId = () => `s${++studentCounter}`;

const role = 'admin';

export default function StudentsPage() {
  const [students, setStudents] = useState(mockStudents);
  const [classrooms] = useState(mockClassrooms);
  const [parents] = useState(mockParents);
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

  const onSubmit = (data: any) => {
    const newStudent = {
      id: nextStudentId(),
      ...data
    };
    setStudents([...students, newStudent]);
    setIsModalOpen(false);
    reset();
  };

  const toggleStatus = (studentId: string) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, is_active: !s.is_active } : s
    ));
  };

  const deleteStudent = (id: string) => {
    if (confirm('Are you sure?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const openLinkModal = (student: any) => {
    setSelectedStudent(student);
    setIsLinkModalOpen(true);
  };

  const linkParent = (parentId: string) => {
    setStudents(students.map(s => 
      s.id === selectedStudent.id ? { ...s, parent_id: parentId } : s
    ));
    setIsLinkModalOpen(false);
    setSelectedStudent(null);
  };

  const unlinkParent = () => {
    setStudents(students.map(s => 
      s.id === selectedStudent.id ? { ...s, parent_id: null } : s
    ));
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
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Students</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Manage student records and RFID assignments</p>
        </div>
        {role === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-95 text-sm"
          >
            <Plus size={18} />
            Add Student
          </button>
        )}
      </div>

      <div className="bg-white p-3 md:p-4 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4 flex-1">
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
            className="px-3 md:px-4 py-2 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 outline-none focus:ring-2 ring-zinc-100"
          >
            <option value="all">All Classes</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50">
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
                <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest text-right hidden sm:table-cell">Actions</th>
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
                        <p className="text-[10px] md:text-xs text-zinc-500 hidden sm:block">{student.admissionNo || student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {student.class}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                    <code className="text-[10px] md:text-xs font-mono bg-zinc-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded border border-zinc-200 text-zinc-600">
                      {student.rfid_uid}
                    </code>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
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
                        Link
                      </button>
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <button 
                      onClick={() => toggleStatus(student.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border ${
                        student.is_active 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}
                    >
                      {student.is_active ? <CheckCircle2 size={10} className="md:w-3 md:h-3" /> : <XCircle size={10} className="md:w-3 md:h-3" />}
                      {student.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-right hidden sm:table-cell">
                    <div className="flex items-center justify-end gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 md:p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
                        <Edit2 size={14} className="md:w-4 md:h-4" />
                      </button>
                      <button 
                        onClick={() => deleteStudent(student.id)}
                        className="p-1.5 md:p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Users size={14} className="md:w-4 md:h-4" />
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
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Add New Student</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <XCircleIcon size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Profile Picture Upload */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden">
                    <Camera size={32} className="text-zinc-400" />
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <Upload size={14} />
                  </button>
                </div>
              </div>
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

      {isLinkModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Link Parent</h3>
                <p className="text-sm text-zinc-500 mt-1">Link a parent/guardian to {selectedStudent.name}</p>
              </div>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <XCircleIcon size={24} />
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
