'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Users, 
  User, 
  Trash2,
  ChevronRight,
  X,
  TrendingUp,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';

const mockClassrooms = [
  { id: '1', name: 'Primary 1', section: 'A', teacher_name: 'Mrs. Sarah Johnson', student_count: 28, description: 'Introduction to basic subjects and social skills.' },
  { id: '2', name: 'Primary 2', section: 'A', teacher_name: 'Mr. Michael Brown', student_count: 32, description: 'Building foundational literacy and numeracy skills.' },
  { id: '3', name: 'Primary 3', section: 'A', teacher_name: 'Mrs. Emily Davis', student_count: 30, description: 'Developing critical thinking and problem solving.' },
  { id: '4', name: 'JSS 1', section: 'Science', teacher_name: 'Mr. James Wilson', student_count: 25, description: 'Science and technology focused curriculum.' },
  { id: '5', name: 'SSS 2', section: 'Commercial', teacher_name: 'Mrs. Patricia Moore', student_count: 35, description: 'Commerce, accounting and business studies.' },
];

const mockTeachers = [
  { id: 't1', name: 'Mrs. Sarah Johnson', email: 'sarah.johnson@school.com' },
  { id: 't2', name: 'Mr. Michael Brown', email: 'michael.brown@school.com' },
  { id: 't3', name: 'Mrs. Emily Davis', email: 'emily.davis@school.com' },
  { id: 't4', name: 'Mr. James Wilson', email: 'james.wilson@school.com' },
  { id: 't5', name: 'Mrs. Patricia Moore', email: 'patricia.moore@school.com' },
];

const mockStudents = [
  { id: 's1', name: 'Adebayo Oluwaseun', rfid_uid: '1A2B3C4D', studentIdNumber: 'STD001', is_active: true, class: 'Primary 1' },
  { id: 's2', name: 'Chukwu Adaobi', rfid_uid: '5E6F7G8H', studentIdNumber: 'STD002', is_active: true, class: 'Primary 1' },
  { id: 's3', name: 'Okonkwo Chibueze', rfid_uid: '9I0J1K2L', studentIdNumber: 'STD003', is_active: true, class: 'Primary 2' },
  { id: 's4', name: 'Nnamdi Somtochi', rfid_uid: '3M4N5O6P', studentIdNumber: 'STD004', is_active: true, class: 'JSS 1' },
  { id: 's5', name: 'Eze Ifeoma', rfid_uid: '7Q8R9S0T', studentIdNumber: 'STD005', is_active: false, class: 'SSS 2' },
];

const role = 'admin';

export default function ClassroomsPage() {
  const [classrooms] = useState(mockClassrooms);
  const [teachers] = useState(mockTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    teacher_id: '',
    teacher_name: '',
    description: ''
  });

  const classStudents = selectedClass 
    ? mockStudents.filter(s => s.class === selectedClass.name)
    : [];

  const stats = {
    present: Math.floor(classStudents.length * 0.85),
    total: classStudents.length * 5,
    rate: 85
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setFormData({ name: '', section: '', teacher_id: '', teacher_name: '', description: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this classroom?')) {
      console.log('Delete classroom:', id);
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

      {!loading && filteredClasses.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-4 bg-white rounded-3xl border border-dashed border-zinc-200">
          <BookOpen size={64} strokeWidth={1} />
          <div className="text-center">
            <p className="text-lg font-bold text-zinc-900">No classrooms found</p>
            <p className="text-sm">Start by creating your first classroom and assigning a teacher.</p>
          </div>
        </div>
      )}

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
