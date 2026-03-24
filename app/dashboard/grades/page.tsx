'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  FileText,
  Printer,
  Save,
  X,
  ChevronDown,
  GraduationCap,
  User,
  Building,
  Calendar,
  TrendingUp,
  BookOpen
} from 'lucide-react';

// Types matching our schema
interface SubjectGrade {
  subject: string;
  firstCA: number;
  secondCA: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

interface AffectiveRating {
  domain: string;
  rating: number;
}

interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  admissionNo: string;
  gender: string;
  dateOfBirth: string;
  term: number;
  session: string;
  schoolOpened: number;
  timesPresent: number;
  timesAbsent: number;
  subjects: SubjectGrade[];
  affective: AffectiveRating[];
  classTeacherRemark: string;
  headTeacherRemark: string;
  fees: {
    tuition: number;
    exam: number;
    sport: number;
    lesson: number;
    other: number;
    outstanding: number;
  };
}

// Default school info (would come from database)
const schoolInfo = {
  name: 'Greenfield Academy',
  address: '123 Education Street, Lagos, Nigeria',
  email: 'info@greenfield.edu.ng',
  phone: '+234 801 234 5678',
  motto: 'Education for Excellence',
};

// Nigerian curriculum subjects
const NIGERIAN_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Igbo/Yoruba/Hausa Language',
  'Social Studies',
  'Basic Science',
  'Civic Education',
  'Computer Studies',
  'Agricultural Science',
  'Home Economics',
  'C.R.S / I.R.S',
  'Physical & Health Education',
  'Fine Arts',
  'Music',
  'Writing',
  'Verbal Reasoning',
  'Quantitative Reasoning',
];

// Affective domains
const AFFECTIVE_DOMAINS = [
  'Punctuality',
  'Attendance',
  'Self-Control',
  'Neatness',
  'Responsibility',
  'Diligence',
  'Attentiveness',
  'Leadership',
  'Accuracy',
  'Sports & Games',
];

// Grading scale
const GRADES = [
  { min: 70, max: 100, grade: 'A', remark: 'Excellent' },
  { min: 60, max: 69, grade: 'B', remark: 'Very Good' },
  { min: 50, max: 59, grade: 'C', remark: 'Good' },
  { min: 45, max: 49, grade: 'D', remark: 'Fair' },
  { min: 40, max: 44, grade: 'E', remark: 'Poor' },
  { min: 0, max: 39, grade: 'F', remark: 'Fail' },
];

// Rating scale (1-5)
const RATINGS = [
  { value: 5, label: 'Excellent' },
  { value: 4, label: 'Very Good' },
  { value: 3, label: 'Good' },
  { value: 2, label: 'Poor' },
  { value: 1, label: 'Very Poor' },
];

// Mock students
const mockStudents = [
  { id: 's1', name: 'Chukwuemeka Okafor', class: 'Primary 5', admissionNo: 'GA/2023/001', gender: 'Male', dob: '2015-03-12' },
  { id: 's2', name: 'Adaeze Nwosu', class: 'Primary 5', admissionNo: 'GA/2023/002', gender: 'Female', dob: '2014-11-08' },
  { id: 's3', name: 'Oluwaseun Adebayo', class: 'JSS 2', admissionNo: 'GA/2022/015', gender: 'Male', dob: '2012-07-22' },
];

// Calculate total and grade
const calculateGrade = (firstCA: number, secondCA: number, exam: number) => {
  const total = firstCA + secondCA + exam;
  const gradeInfo = GRADES.find(g => total >= g.min && total <= g.max);
  return {
    total,
    grade: gradeInfo?.grade || 'F',
    remark: gradeInfo?.remark || 'Fail',
  };
};

export default function GradesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'academic' | 'affective' | 'remarks'>('academic');
  
  // Form state
  const [formData, setFormData] = useState<Partial<ReportCard>>({
    term: 1,
    session: '2025/2026',
    schoolOpened: 120,
    timesPresent: 112,
    timesAbsent: 8,
    subjects: NIGERIAN_SUBJECTS.map(subject => ({
      subject,
      firstCA: 0,
      secondCA: 0,
      exam: 0,
      total: 0,
      grade: 'F',
      remark: 'Fail',
    })),
    affective: AFFECTIVE_DOMAINS.map(domain => ({
      domain,
      rating: 3,
    })),
    classTeacherRemark: '',
    headTeacherRemark: '',
    fees: {
      tuition: 50000,
      exam: 1000,
      sport: 500,
      lesson: 2000,
      other: 0,
      outstanding: 0,
    },
  });

  const filteredStudents = mockStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReport = (student: typeof mockStudents[0]) => {
    setSelectedStudent(student);
    setFormData({
      ...formData,
      studentId: student.id,
      studentName: student.name,
      studentClass: student.class,
      admissionNo: student.admissionNo,
      gender: student.gender,
      dateOfBirth: student.dob,
    });
    setShowCreateModal(true);
  };

  const updateSubjectGrade = (index: number, field: keyof SubjectGrade, value: number) => {
    const newSubjects = [...(formData.subjects || [])];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    
    // Recalculate total and grade
    if (field === 'firstCA' || field === 'secondCA' || field === 'exam') {
      const calc = calculateGrade(
        field === 'firstCA' ? value : newSubjects[index].firstCA,
        field === 'secondCA' ? value : newSubjects[index].secondCA,
        field === 'exam' ? value : newSubjects[index].exam
      );
      newSubjects[index] = { 
        ...newSubjects[index], 
        [field]: value,
        total: calc.total,
        grade: calc.grade,
        remark: calc.remark,
      };
    }
    
    setFormData({ ...formData, subjects: newSubjects });
  };

  const updateAffectiveRating = (index: number, rating: number) => {
    const newAffective = [...(formData.affective || [])];
    newAffective[index] = { ...newAffective[index], rating };
    setFormData({ ...formData, affective: newAffective });
  };

  const calculateOverallStats = () => {
    const subjects = formData.subjects || [];
    const total = subjects.reduce((sum, s) => sum + s.total, 0);
    const average = subjects.length > 0 ? Math.round(total / subjects.length) : 0;
    const gradeInfo = GRADES.find(g => average >= g.min && average <= g.max);
    return { total, average, grade: gradeInfo?.grade || 'F' };
  };

  const generatePDF = () => {
    window.print();
  };

  const stats = calculateOverallStats();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Report Cards</h1>
          <p className="text-zinc-500 mt-1 text-sm">Create and manage student terminal reports</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText size={18} className="text-blue-600" />
            </div>
            <span className="text-xs text-zinc-500">Total Reports</span>
          </div>
          <p className="text-xl font-bold text-zinc-900">24</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp size={18} className="text-green-600" />
            </div>
            <span className="text-xs text-zinc-500">Class Average</span>
          </div>
          <p className="text-xl font-bold text-zinc-900">72%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GraduationCap size={18} className="text-purple-600" />
            </div>
            <span className="text-xs text-zinc-500">Promoted</span>
          </div>
          <p className="text-xl font-bold text-zinc-900">18</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <User size={18} className="text-amber-600" />
            </div>
            <span className="text-xs text-zinc-500">Pending</span>
          </div>
          <p className="text-xl font-bold text-zinc-900">6</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select className="px-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-white">
            <option>First Term</option>
            <option>Second Term</option>
            <option>Third Term</option>
          </select>
          <select className="px-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-white">
            <option>2025/2026</option>
            <option>2024/2025</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100">
          <h3 className="font-bold text-zinc-900">Students</h3>
        </div>
        <div className="divide-y divide-zinc-100">
          {filteredStudents.map((student) => (
            <div key={student.id} className="p-4 flex items-center justify-between hover:bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{student.name}</p>
                  <p className="text-xs text-zinc-500">{student.class} • {student.admissionNo}</p>
                </div>
              </div>
              <button
                onClick={() => handleCreateReport(student)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700"
              >
                <Plus size={16} />
                Create Report
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Report Modal */}
      {showCreateModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Create Report Card</h3>
                <p className="text-sm text-zinc-500">{selectedStudent.name} • {selectedStudent.class}</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-zinc-200 rounded-lg">
                <X size={20} className="text-zinc-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200">
              {(['academic', 'affective', 'remarks'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-bold capitalize ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Academic Tab */}
              {activeTab === 'academic' && (
                <div className="space-y-6">
                  {/* School Info (Read-only) */}
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Building size={16} className="text-blue-600" />
                      <span className="font-bold text-blue-900 text-sm">School Information</span>
                    </div>
                    <p className="text-sm text-blue-800">{schoolInfo.name}</p>
                    <p className="text-xs text-blue-600">{schoolInfo.address}</p>
                  </div>

                  {/* Student Info (Read-only) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Student Name</label>
                      <input 
                        type="text" 
                        value={selectedStudent.name}
                        disabled
                        className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm text-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Class</label>
                      <input 
                        type="text" 
                        value={selectedStudent.class}
                        disabled
                        className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm text-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Admission No</label>
                      <input 
                        type="text" 
                        value={selectedStudent.admissionNo}
                        disabled
                        className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm text-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Gender</label>
                      <input 
                        type="text" 
                        value={selectedStudent.gender}
                        disabled
                        className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm text-zinc-600"
                      />
                    </div>
                  </div>

                  {/* Term Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Term</label>
                      <select 
                        value={formData.term}
                        onChange={(e) => setFormData({...formData, term: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                      >
                        <option value={1}>First Term</option>
                        <option value={2}>Second Term</option>
                        <option value={3}>Third Term</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Session</label>
                      <input 
                        type="text" 
                        value={formData.session}
                        onChange={(e) => setFormData({...formData, session: e.target.value})}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Times School Opened</label>
                      <input 
                        type="number" 
                        value={formData.schoolOpened}
                        onChange={(e) => setFormData({...formData, schoolOpened: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Times Present</label>
                      <input 
                        type="number" 
                        value={formData.timesPresent}
                        onChange={(e) => {
                          const present = parseInt(e.target.value) || 0;
                          const opened = formData.schoolOpened || 0;
                          setFormData({
                            ...formData, 
                            timesPresent: present,
                            timesAbsent: opened - present
                          });
                        }}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="bg-zinc-50 p-4 rounded-xl flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-xs text-zinc-500">Total Score</p>
                      <p className="text-xl font-bold text-zinc-900">{stats.total}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-zinc-500">Average</p>
                      <p className="text-xl font-bold text-blue-600">{stats.average}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-zinc-500">Grade</p>
                      <p className="text-xl font-bold text-green-600">{stats.grade}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-zinc-500">Attendance</p>
                      <p className="text-xl font-bold text-purple-600">
                        {formData.schoolOpened && formData.timesPresent ? Math.round((formData.timesPresent / formData.schoolOpened) * 100) : 0}%
                      </p>
                    </div>
                  </div>

                  {/* Subjects Table */}
                  <div>
                    <h4 className="font-bold text-zinc-900 mb-3 flex items-center gap-2">
                      <BookOpen size={16} />
                      Subject Grades
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-zinc-50">
                            <th className="text-left py-2 px-3 font-bold text-zinc-600">Subject</th>
                            <th className="py-2 px-3 font-bold text-zinc-600">1st C.A (/20)</th>
                            <th className="py-2 px-3 font-bold text-zinc-600">2nd C.A (/20)</th>
                            <th className="py-2 px-3 font-bold text-zinc-600">Exam (/60)</th>
                            <th className="py-2 px-3 font-bold text-zinc-600">Total</th>
                            <th className="py-2 px-3 font-bold text-zinc-600">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {formData.subjects?.map((subject, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-3 font-medium">{subject.subject}</td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  value={subject.firstCA || ''}
                                  onChange={(e) => updateSubjectGrade(idx, 'firstCA', parseInt(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 border border-zinc-200 rounded text-center text-sm"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  value={subject.secondCA || ''}
                                  onChange={(e) => updateSubjectGrade(idx, 'secondCA', parseInt(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 border border-zinc-200 rounded text-center text-sm"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="60"
                                  value={subject.exam || ''}
                                  onChange={(e) => updateSubjectGrade(idx, 'exam', parseInt(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 border border-zinc-200 rounded text-center text-sm"
                                />
                              </td>
                              <td className="py-2 px-3 font-bold">{subject.total}</td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  subject.grade === 'A' ? 'bg-green-100 text-green-700' :
                                  subject.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                  subject.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                                  subject.grade === 'D' ? 'bg-orange-100 text-orange-700' :
                                  subject.grade === 'E' ? 'bg-pink-100 text-pink-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {subject.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Affective Tab */}
              {activeTab === 'affective' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.affective?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                        <span className="font-medium text-sm">{item.domain}</span>
                        <select
                          value={item.rating}
                          onChange={(e) => updateAffectiveRating(idx, parseInt(e.target.value))}
                          className="px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                        >
                          {RATINGS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.value} - {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks Tab */}
              {activeTab === 'remarks' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Class Teacher&apos;s Remark</label>
                    <textarea
                      value={formData.classTeacherRemark}
                      onChange={(e) => setFormData({...formData, classTeacherRemark: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm"
                      placeholder="Enter class teacher's comment..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Head Teacher&apos;s Remark</label>
                    <textarea
                      value={formData.headTeacherRemark}
                      onChange={(e) => setFormData({...formData, headTeacherRemark: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm"
                      placeholder="Enter head teacher's comment..."
                    />
                  </div>

                  {/* School Fees */}
                  <div className="bg-zinc-50 p-4 rounded-xl">
                    <h4 className="font-bold text-zinc-900 mb-3">School Fees (₦)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Tuition</label>
                        <input
                          type="number"
                          value={formData.fees?.tuition}
                          onChange={(e) => setFormData({
                            ...formData, 
                            fees: {...formData.fees!, tuition: parseInt(e.target.value) || 0}
                          })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Exam</label>
                        <input
                          type="number"
                          value={formData.fees?.exam}
                          onChange={(e) => setFormData({
                            ...formData, 
                            fees: {...formData.fees!, exam: parseInt(e.target.value) || 0}
                          })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Sport</label>
                        <input
                          type="number"
                          value={formData.fees?.sport}
                          onChange={(e) => setFormData({
                            ...formData, 
                            fees: {...formData.fees!, sport: parseInt(e.target.value) || 0}
                          })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Lesson</label>
                        <input
                          type="number"
                          value={formData.fees?.lesson}
                          onChange={(e) => setFormData({
                            ...formData, 
                            fees: {...formData.fees!, lesson: parseInt(e.target.value) || 0}
                          })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Outstanding</label>
                        <input
                          type="number"
                          value={formData.fees?.outstanding}
                          onChange={(e) => setFormData({
                            ...formData, 
                            fees: {...formData.fees!, outstanding: parseInt(e.target.value) || 0}
                          })}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowPreviewModal(true);
                }}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Preview & Print
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-900">Report Card Preview</h3>
              <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X size={20} className="text-zinc-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Simple Preview */}
              <div className="border-2 border-zinc-900 p-6">
                {/* Header */}
                <div className="text-center border-b-2 border-zinc-900 pb-4 mb-4">
                  <h2 className="text-xl font-bold text-red-700">{schoolInfo.name}</h2>
                  <p className="text-xs text-zinc-600">{schoolInfo.address}</p>
                  <p className="text-xs text-zinc-600">{schoolInfo.phone} • {schoolInfo.email}</p>
                  <p className="text-sm font-bold text-red-700 mt-1">{schoolInfo.motto}</p>
                  <div className="mt-3 inline-block border-2 border-zinc-900 px-4 py-1">
                    <span className="font-bold">{formData.term === 1 ? 'FIRST' : formData.term === 2 ? 'SECOND' : 'THIRD'} TERM REPORT</span>
                  </div>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div><strong>Name:</strong> {selectedStudent.name}</div>
                  <div><strong>Class:</strong> {selectedStudent.class}</div>
                  <div><strong>Admission No:</strong> {selectedStudent.admissionNo}</div>
                  <div><strong>Gender:</strong> {selectedStudent.gender}</div>
                  <div><strong>Term:</strong> {formData.term}</div>
                  <div><strong>Session:</strong> {formData.session}</div>
                </div>

                {/* Attendance */}
                <div className="text-sm mb-4">
                  <strong>School Opened:</strong> {formData.schoolOpened} days | 
                  <strong> Present:</strong> {formData.timesPresent} days | 
                  <strong> Absent:</strong> {formData.timesAbsent} days
                </div>

                {/* Summary */}
                <div className="bg-zinc-100 p-3 mb-4 text-center text-sm">
                  <strong>Total Score:</strong> {stats.total} | 
                  <strong> Average:</strong> {stats.average}% | 
                  <strong> Grade:</strong> {stats.grade}
                </div>

                {/* Subjects */}
                <table className="w-full text-xs mb-4">
                  <thead>
                    <tr className="bg-zinc-100">
                      <th className="border border-zinc-900 p-1 text-left">Subject</th>
                      <th className="border border-zinc-900 p-1">C.A 1</th>
                      <th className="border border-zinc-900 p-1">C.A 2</th>
                      <th className="border border-zinc-900 p-1">Exam</th>
                      <th className="border border-zinc-900 p-1">Total</th>
                      <th className="border border-zinc-900 p-1">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.subjects?.filter(s => s.total > 0).map((subject, idx) => (
                      <tr key={idx}>
                        <td className="border border-zinc-900 p-1">{subject.subject}</td>
                        <td className="border border-zinc-900 p-1 text-center">{subject.firstCA}</td>
                        <td className="border border-zinc-900 p-1 text-center">{subject.secondCA}</td>
                        <td className="border border-zinc-900 p-1 text-center">{subject.exam}</td>
                        <td className="border border-zinc-900 p-1 text-center font-bold">{subject.total}</td>
                        <td className="border border-zinc-900 p-1 text-center">{subject.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Remarks */}
                {formData.classTeacherRemark && (
                  <div className="text-sm mb-2">
                    <strong>Class Teacher&apos;s Remark:</strong> {formData.classTeacherRemark}
                  </div>
                )}
                {formData.headTeacherRemark && (
                  <div className="text-sm">
                    <strong>Head Teacher&apos;s Remark:</strong> {formData.headTeacherRemark}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200">
              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print Report Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

