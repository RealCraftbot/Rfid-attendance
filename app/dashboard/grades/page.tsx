'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  FileText,
  Printer,
  Save,
  X,
  GraduationCap,
  User,
  Building,
  TrendingUp,
  BookOpen,
  Calendar,
  CheckCircle2,
  Upload,
  Camera,
  Eye,
  History,
  Wallet,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { RoleGuard } from '@/components/RoleGuard';
import { useRBAC } from '@/hooks/use-rbac';

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

interface AuditLog {
  id: string;
  action: string;
  user: string;
  userRole: string;
  timestamp: string;
  changes: string;
}

interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentImage?: string;
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
    total: number;
  };
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

interface Student {
  id: string;
  name: string;
  class: string;
  admissionNo: string;
  gender: string;
  dob: string;
  imageUrl: string | null;
  rfidAttendance: { total: number; absent: number; percentage: number };
}

const schoolInfo = {
  name: '',
  address: '',
  email: '',
  phone: '',
  motto: '',
  logo: null as string | null,
};

const NIGERIAN_SUBJECTS = [
  'Mathematics', 'English Language', 'Igbo/Yoruba/Hausa Language',
  'Social Studies', 'Basic Science', 'Civic Education',
  'Computer Studies', 'Agricultural Science', 'Home Economics',
  'C.R.S / I.R.S', 'Physical & Health Education', 'Fine Arts',
  'Music', 'Writing', 'Verbal Reasoning', 'Quantitative Reasoning',
];

const AFFECTIVE_DOMAINS = [
  'Punctuality', 'Attendance', 'Self-Control', 'Neatness',
  'Responsibility', 'Diligence', 'Attentiveness', 'Leadership',
  'Accuracy', 'Sports & Games',
];

const GRADES = [
  { min: 70, max: 100, grade: 'A', remark: 'Excellent' },
  { min: 60, max: 69, grade: 'B', remark: 'Very Good' },
  { min: 50, max: 59, grade: 'C', remark: 'Good' },
  { min: 45, max: 49, grade: 'D', remark: 'Fair' },
  { min: 40, max: 44, grade: 'E', remark: 'Poor' },
  { min: 0, max: 39, grade: 'F', remark: 'Fail' },
];

const RATINGS = [
  { value: 5, label: 'Excellent' },
  { value: 4, label: 'Very Good' },
  { value: 3, label: 'Good' },
  { value: 2, label: 'Poor' },
  { value: 1, label: 'Very Poor' },
];

const calculateGrade = (firstCA: number, secondCA: number, exam: number) => {
  const total = firstCA + secondCA + exam;
  const gradeInfo = GRADES.find(g => total >= g.min && total <= g.max);
  return { total, grade: gradeInfo?.grade || 'F', remark: gradeInfo?.remark || 'Fail' };
};

function GradesContent() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'academic' | 'affective' | 'remarks'>('academic');
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          const mappedStudents = (json.data || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            class: s.classroom?.name || s.grade || 'Not Assigned',
            admissionNo: s.admissionNumber || 'N/A',
            gender: 'N/A',
            dob: s.dateOfBirth || '',
            imageUrl: s.imageUrl,
            rfidAttendance: { total: 0, absent: 0, percentage: 0 }
          }));
          setStudents(mappedStudents);
        }
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const [formData, setFormData] = useState<Partial<ReportCard>>({
    term: 1,
    session: '2025/2026',
    schoolOpened: 120,
    subjects: NIGERIAN_SUBJECTS.map(subject => ({
      subject, firstCA: 0, secondCA: 0, exam: 0, total: 0, grade: 'F', remark: 'Fail',
    })),
    affective: AFFECTIVE_DOMAINS.map(domain => ({ domain, rating: 3 })),
    classTeacherRemark: '',
    headTeacherRemark: '',
    fees: {
      tuition: 50000,
      exam: 1000,
      sport: 500,
      lesson: 2000,
      other: 1500,
      outstanding: 0,
      total: 58500,
    },
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReport = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      ...formData,
      studentId: student.id,
      studentName: student.name,
      studentClass: student.class,
      admissionNo: student.admissionNo,
      gender: student.gender,
      dateOfBirth: student.dob,
      timesPresent: student.rfidAttendance.total,
      timesAbsent: student.rfidAttendance.absent,
      createdBy: 'Teacher',
      createdAt: new Date().toISOString(),
    });
    setShowCreateModal(true);
  };

  const updateSubjectGrade = (index: number, field: keyof SubjectGrade, value: number) => {
    const newSubjects = [...(formData.subjects || [])];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    
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
    
    setFormData({ 
      ...formData, 
      subjects: newSubjects,
      lastModifiedBy: 'Teacher',
      lastModifiedAt: new Date().toISOString(),
    });
  };

  const updateAffectiveRating = (index: number, rating: number) => {
    const newAffective = [...(formData.affective || [])];
    newAffective[index] = { ...newAffective[index], rating };
    setFormData({ 
      ...formData, 
      affective: newAffective,
      lastModifiedBy: 'Teacher',
      lastModifiedAt: new Date().toISOString(),
    });
  };

  const handleStudentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedStudent) {
      const reader = new FileReader();
      reader.onloadend = () => {
        selectedStudent.imageUrl = reader.result as string;
        setFormData({ ...formData, studentImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateOverallStats = () => {
    const subjects = formData.subjects || [];
    const total = subjects.reduce((sum, s) => sum + s.total, 0);
    const average = subjects.length > 0 ? Math.round(total / subjects.length) : 0;
    const gradeInfo = GRADES.find(g => average >= g.min && average <= g.max);
    return { total, average, grade: gradeInfo?.grade || 'F' };
  };

  const stats = calculateOverallStats();
  const attendancePercentage = formData.schoolOpened && formData.timesPresent 
    ? Math.round((formData.timesPresent / formData.schoolOpened) * 100) 
    : 0;

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">Report Cards</h1>
          <p className="text-zinc-500 mt-1 text-xs sm:text-sm">Create and manage student terminal reports</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => logoInputRef.current?.click()}
            className="flex items-center gap-1.5 sm:gap-2 bg-white text-zinc-700 border border-zinc-200 px-2 sm:px-4 py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-zinc-50"
          >
            <Upload size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Upload Logo</span>
            <span className="sm:hidden">Logo</span>
          </button>
          <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
        </div>
      </div>

      {/* Stats - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <FileText size={16} className="text-blue-600 sm:w-[18px] sm:h-[18px]" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Total Students</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-zinc-900">{students.length}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <TrendingUp size={16} className="text-green-600 sm:w-[18px] sm:h-[18px]" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Reports Created</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-zinc-900">0</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
              <GraduationCap size={16} className="text-purple-600 sm:w-[18px] sm:h-[18px]" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Classes</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-zinc-900">{new Set(students.map(s => s.class)).size}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg">
              <User size={16} className="text-amber-600 sm:w-[18px] sm:h-[18px]" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Active Students</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-zinc-900">{students.filter(s => s.rfidAttendance.percentage > 0).length}</p>
        </div>
      </div>

      {/* Search - Responsive */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex gap-2">
            <select className="flex-1 sm:flex-none px-3 py-2 border border-zinc-200 rounded-lg sm:rounded-xl text-xs sm:text-sm bg-white">
              <option>First Term</option>
              <option>Second Term</option>
              <option>Third Term</option>
            </select>
            <select className="flex-1 sm:flex-none px-3 py-2 border border-zinc-200 rounded-lg sm:rounded-xl text-xs sm:text-sm bg-white">
              <option>2025/2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List - Mobile Responsive */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-zinc-100">
          <h3 className="font-bold text-zinc-900 text-sm sm:text-base">Students</h3>
        </div>
        <div className="divide-y divide-zinc-100">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 size={32} className="mx-auto mb-3 text-zinc-300 animate-spin" />
              <p className="text-zinc-500 text-sm">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-zinc-500 text-sm">No students found</p>
            </div>
          ) : filteredStudents.map((student) => (
            <div key={student.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {student.imageUrl ? (
                    <img src={student.imageUrl} alt={student.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-blue-200" />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm sm:text-base border-2 border-blue-200">
                      {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle2 size={8} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-zinc-900 text-sm sm:text-base">{student.name}</p>
                  <p className="text-[10px] sm:text-xs text-zinc-500">{student.class} • {student.admissionNo}</p>
                  <p className="text-[10px] sm:text-xs text-green-600">Attendance: {student.rfidAttendance.percentage}%</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCreateReport(student)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-700"
                >
                  <Plus size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Create Report</span>
                  <span className="sm:hidden">Create</span>
                </button>
                <button
                  onClick={() => setShowAuditModal(true)}
                  className="p-2 border border-zinc-200 rounded-lg sm:rounded-xl hover:bg-zinc-50"
                  title="View Audit Log"
                >
                  <History size={16} className="text-zinc-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Report Modal - Responsive */}
      {showCreateModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-3 sm:p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900">Create Report Card</h3>
                <p className="text-xs sm:text-sm text-zinc-500">{selectedStudent.name} • {selectedStudent.class}</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 sm:p-2 hover:bg-zinc-200 rounded-lg">
                <X size={18} className="sm:w-5 sm:h-5 text-zinc-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 overflow-x-auto">
              {(['academic', 'affective', 'remarks'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold capitalize whitespace-nowrap ${
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
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {activeTab === 'academic' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* School & Student Info */}
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Building size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                      <span className="font-bold text-blue-900 text-xs sm:text-sm">{schoolInfo.name}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-blue-700">{schoolInfo.address}</p>
                    
                    {/* Student Photo Upload */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="relative">
                        {selectedStudent.imageUrl ? (
                          <img src={selectedStudent.imageUrl} alt="Student" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-blue-300" />
                        ) : (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-dashed border-blue-300 flex items-center justify-center">
                            <Camera size={20} className="text-blue-400" />
                          </div>
                        )}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
                        >
                          <Upload size={12} />
                        </button>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleStudentImageUpload} className="hidden" />
                      <div>
                        <p className="font-bold text-sm text-zinc-900">{selectedStudent.name}</p>
                        <p className="text-xs text-zinc-500">{selectedStudent.admissionNo}</p>
                        <p className="text-xs text-green-600">RFID Attendance: {selectedStudent.rfidAttendance.total}/{selectedStudent.rfidAttendance.total + selectedStudent.rfidAttendance.absent}</p>
                      </div>
                    </div>
                  </div>

                  {/* Term Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold text-zinc-400 uppercase mb-1">Term</label>
                      <select 
                        value={formData.term}
                        onChange={(e) => setFormData({...formData, term: parseInt(e.target.value)})}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-zinc-200 rounded-lg text-xs sm:text-sm"
                      >
                        <option value={1}>First Term</option>
                        <option value={2}>Second Term</option>
                        <option value={3}>Third Term</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold text-zinc-400 uppercase mb-1">Session</label>
                      <input 
                        type="text" 
                        value={formData.session}
                        onChange={(e) => setFormData({...formData, session: e.target.value})}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-zinc-200 rounded-lg text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold text-zinc-400 uppercase mb-1">Days Opened</label>
                      <input 
                        type="number" 
                        value={formData.schoolOpened}
                        onChange={(e) => setFormData({...formData, schoolOpened: parseInt(e.target.value) || 0})}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-zinc-200 rounded-lg text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold text-zinc-400 uppercase mb-1">Days Present</label>
                      <input 
                        type="number" 
                        value={formData.timesPresent}
                        disabled
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm text-green-700"
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="bg-zinc-50 p-3 sm:p-4 rounded-xl grid grid-cols-4 gap-2 sm:gap-4 text-center">
                    <div>
                      <p className="text-[10px] sm:text-xs text-zinc-500">Total</p>
                      <p className="text-base sm:text-xl font-bold text-zinc-900">{stats.total}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-zinc-500">Average</p>
                      <p className="text-base sm:text-xl font-bold text-blue-600">{stats.average}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-zinc-500">Grade</p>
                      <p className="text-base sm:text-xl font-bold text-green-600">{stats.grade}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-zinc-500">Attendance</p>
                      <p className="text-base sm:text-xl font-bold text-purple-600">{attendancePercentage}%</p>
                    </div>
                  </div>

                  {/* Subjects Table - Mobile Scrollable */}
                  <div className="overflow-x-auto -mx-3 px-3">
                    <table className="w-full text-xs sm:text-sm min-w-[500px]">
                      <thead>
                        <tr className="bg-zinc-50">
                          <th className="text-left py-2 px-2 sm:px-3 font-bold text-zinc-600">Subject</th>
                          <th className="py-2 px-2 sm:px-3 font-bold text-zinc-600">CA1</th>
                          <th className="py-2 px-2 sm:px-3 font-bold text-zinc-600">CA2</th>
                          <th className="py-2 px-2 sm:px-3 font-bold text-zinc-600">Exam</th>
                          <th className="py-2 px-2 sm:px-3 font-bold text-zinc-600">Total</th>
                          <th className="py-2 px-2 sm:px-3 font-bold text-zinc-600">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {formData.subjects?.map((subject, idx) => (
                          <tr key={idx}>
                            <td className="py-1.5 sm:py-2 px-2 sm:px-3 font-medium text-xs sm:text-sm">{subject.subject}</td>
                            <td className="py-1.5 sm:py-2 px-1 sm:px-2">
                              <input type="number" min="0" max="20" value={subject.firstCA || ''} onChange={(e) => updateSubjectGrade(idx, 'firstCA', parseInt(e.target.value) || 0)} className="w-10 sm:w-12 px-1 py-1 border border-zinc-200 rounded text-center text-xs sm:text-sm" />
                            </td>
                            <td className="py-1.5 sm:py-2 px-1 sm:px-2">
                              <input type="number" min="0" max="20" value={subject.secondCA || ''} onChange={(e) => updateSubjectGrade(idx, 'secondCA', parseInt(e.target.value) || 0)} className="w-10 sm:w-12 px-1 py-1 border border-zinc-200 rounded text-center text-xs sm:text-sm" />
                            </td>
                            <td className="py-1.5 sm:py-2 px-1 sm:px-2">
                              <input type="number" min="0" max="60" value={subject.exam || ''} onChange={(e) => updateSubjectGrade(idx, 'exam', parseInt(e.target.value) || 0)} className="w-10 sm:w-12 px-1 py-1 border border-zinc-200 rounded text-center text-xs sm:text-sm" />
                            </td>
                            <td className="py-1.5 sm:py-2 px-2 sm:px-3 font-bold text-xs sm:text-sm">{subject.total}</td>
                            <td className="py-1.5 sm:py-2 px-2 sm:px-3">
                              <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold ${ subject.grade === 'A' ? 'bg-green-100 text-green-700' : subject.grade === 'B' ? 'bg-blue-100 text-blue-700' : subject.grade === 'C' ? 'bg-yellow-100 text-yellow-700' : subject.grade === 'D' ? 'bg-orange-100 text-orange-700' : subject.grade === 'E' ? 'bg-pink-100 text-pink-700' : 'bg-red-100 text-red-700' }`}>
                                {subject.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'affective' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {formData.affective?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 bg-zinc-50 rounded-xl">
                      <span className="font-medium text-xs sm:text-sm">{item.domain}</span>
                      <select value={item.rating} onChange={(e) => updateAffectiveRating(idx, parseInt(e.target.value))} className="px-2 sm:px-3 py-1.5 border border-zinc-200 rounded-lg text-xs sm:text-sm">
                        {RATINGS.map((r) => (
                          <option key={r.value} value={r.value}>{r.value} - {r.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'remarks' && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-zinc-400 uppercase mb-1.5 sm:mb-2">Class Teacher&apos;s Remark</label>
                    <textarea value={formData.classTeacherRemark} onChange={(e) => setFormData({...formData, classTeacherRemark: e.target.value})} rows={3} className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs sm:text-sm" placeholder="Enter class teacher's comment..." />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-zinc-400 uppercase mb-1.5 sm:mb-2">Head Teacher&apos;s Remark</label>
                    <textarea value={formData.headTeacherRemark} onChange={(e) => setFormData({...formData, headTeacherRemark: e.target.value})} rows={3} className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs sm:text-sm" placeholder="Enter head teacher's comment..." />
                  </div>

                  {/* School Bill - Auto from fee structure */}
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Wallet size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                      <h4 className="font-bold text-blue-900 text-xs sm:text-sm">School Bill (Auto-calculated)</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex justify-between"><span className="text-zinc-600">Tuition:</span> <span className="font-bold">₦{formData.fees?.tuition?.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-zinc-600">Exam:</span> <span className="font-bold">₦{formData.fees?.exam?.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-zinc-600">Sport:</span> <span className="font-bold">₦{formData.fees?.sport?.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-zinc-600">Lesson:</span> <span className="font-bold">₦{formData.fees?.lesson?.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-zinc-600">Other:</span> <span className="font-bold">₦{formData.fees?.other?.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-red-600">Outstanding:</span> <span className="font-bold text-red-600">₦{formData.fees?.outstanding?.toLocaleString()}</span></div>
                      <div className="col-span-2 sm:col-span-3 flex justify-between pt-2 border-t border-blue-200">
                        <span className="font-bold text-blue-900">Total:</span>
                        <span className="font-bold text-blue-900">₦{formData.fees?.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Audit Info */}
                  <div className="bg-amber-50 p-3 rounded-xl text-xs">
                    <p className="text-amber-800"><strong>Created by:</strong> {formData.createdBy || 'Teacher'}</p>
                    <p className="text-amber-800"><strong>Last modified:</strong> {formData.lastModifiedBy || 'Not yet modified'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-zinc-200 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 sm:py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200 text-xs sm:text-sm">Cancel</button>
              <button onClick={() => { setShowCreateModal(false); setShowPreviewModal(true); }} className="flex-1 py-2.5 sm:py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <Eye size={14} className="sm:w-4 sm:h-4" />
                Preview
              </button>
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 sm:py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <Save size={14} className="sm:w-4 sm:h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="p-3 sm:p-4 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900">Report Card Preview</h3>
              <button onClick={() => setShowPreviewModal(false)} className="p-1.5 sm:p-2 hover:bg-zinc-100 rounded-lg">
                <X size={18} className="sm:w-5 sm:h-5 text-zinc-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Styled Report Preview */}
              <div className="border-2 border-blue-600 p-4 sm:p-6 bg-white">
                {/* Header with Logo */}
                <div className="text-center border-b-2 border-blue-600 pb-3 sm:pb-4 mb-3 sm:mb-4">
                  {schoolLogo && (
                    <img src={schoolLogo} alt="School Logo" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 object-contain" />
                  )}
                  <h2 className="text-lg sm:text-xl font-bold text-blue-700">{schoolInfo.name}</h2>
                  <p className="text-[10px] sm:text-xs text-zinc-600">{schoolInfo.address}</p>
                  <p className="text-[10px] sm:text-xs text-zinc-600">{schoolInfo.phone} • {schoolInfo.email}</p>
                  <p className="text-xs sm:text-sm font-bold text-blue-700 mt-1">{schoolInfo.motto}</p>
                  <div className="mt-2 sm:mt-3 inline-block border-2 border-blue-600 px-3 sm:px-4 py-1">
                    <span className="font-bold text-xs sm:text-sm">{formData.term === 1 ? 'FIRST' : formData.term === 2 ? 'SECOND' : 'THIRD'} TERM REPORT</span>
                  </div>
                </div>

                {/* Student Info with Photo */}
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  {selectedStudent.imageUrl ? (
                    <img src={selectedStudent.imageUrl} alt="Student" className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-blue-200" />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                      <User size={24} className="text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1 text-xs sm:text-sm">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div><strong>Name:</strong> {selectedStudent.name}</div>
                      <div><strong>Class:</strong> {selectedStudent.class}</div>
                      <div><strong>Admission No:</strong> {selectedStudent.admissionNo}</div>
                      <div><strong>Gender:</strong> {selectedStudent.gender}</div>
                      <div><strong>Term:</strong> {formData.term}</div>
                      <div><strong>Session:</strong> {formData.session}</div>
                    </div>
                  </div>
                </div>

                {/* Attendance */}
                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm">
                  <strong>Attendance:</strong> {formData.timesPresent} days present out of {formData.schoolOpened} days ({attendancePercentage}%) • RFID Verified
                </div>

                {/* Summary */}
                <div className="bg-blue-100 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 text-center text-xs sm:text-sm">
                  <strong>Total Score:</strong> {stats.total} | <strong>Average:</strong> {stats.average}% | <strong>Grade:</strong> {stats.grade}
                </div>

                {/* Subjects */}
                <table className="w-full text-[10px] sm:text-xs mb-3 sm:mb-4">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-blue-600 p-1 sm:p-2 text-left">Subject</th>
                      <th className="border border-blue-600 p-1 sm:p-2">CA1</th>
                      <th className="border border-blue-600 p-1 sm:p-2">CA2</th>
                      <th className="border border-blue-600 p-1 sm:p-2">Exam</th>
                      <th className="border border-blue-600 p-1 sm:p-2">Total</th>
                      <th className="border border-blue-600 p-1 sm:p-2">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.subjects?.filter(s => s.total > 0).map((subject, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                        <td className="border border-blue-200 p-1 sm:p-2">{subject.subject}</td>
                        <td className="border border-blue-200 p-1 sm:p-2 text-center">{subject.firstCA}</td>
                        <td className="border border-blue-200 p-1 sm:p-2 text-center">{subject.secondCA}</td>
                        <td className="border border-blue-200 p-1 sm:p-2 text-center">{subject.exam}</td>
                        <td className="border border-blue-200 p-1 sm:p-2 text-center font-bold">{subject.total}</td>
                        <td className="border border-blue-200 p-1 sm:p-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${ subject.grade === 'A' ? 'bg-green-200 text-green-800' : subject.grade === 'F' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800' }`}>
                            {subject.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* School Bill */}
                <div className="bg-green-50 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm">
                  <strong className="text-green-800">School Bill:</strong>
                  <div className="grid grid-cols-2 gap-1 mt-1 text-green-700">
                    <div>Tuition: ₦{formData.fees?.tuition?.toLocaleString()}</div>
                    <div>Exam: ₦{formData.fees?.exam?.toLocaleString()}</div>
                    <div>Sport: ₦{formData.fees?.sport?.toLocaleString()}</div>
                    <div>Lesson: ₦{formData.fees?.lesson?.toLocaleString()}</div>
                    <div className="col-span-2 font-bold border-t border-green-200 pt-1 mt-1">Total: ₦{formData.fees?.total?.toLocaleString()}</div>
                  </div>
                </div>

                {/* Remarks */}
                {formData.classTeacherRemark && (
                  <div className="text-xs sm:text-sm mb-2">
                    <strong className="text-blue-700">Class Teacher&apos;s Remark:</strong> {formData.classTeacherRemark}
                  </div>
                )}
                {formData.headTeacherRemark && (
                  <div className="text-xs sm:text-sm">
                    <strong className="text-blue-700">Head Teacher&apos;s Remark:</strong> {formData.headTeacherRemark}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-blue-200 flex justify-between text-[10px] sm:text-xs text-zinc-500">
                  <span>Generated by: Teacher (Teacher)</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-zinc-200">
              <button onClick={() => window.print()} className="w-full py-2.5 sm:py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 text-xs sm:text-sm">
                <Printer size={16} className="sm:w-[18px] sm:h-[18px]" />
                Print Report Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-900">Audit Log</h3>
              <button onClick={() => setShowAuditModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X size={20} className="text-zinc-500" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 max-h-[60vh]">
              <div className="space-y-3">
                {auditLogs.length > 0 ? auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${ log.action === 'Created' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700' }`}>
                        {log.action}
                      </span>
                      <span className="text-xs text-zinc-500">{log.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-900">{log.user} ({log.userRole})</p>
                    <p className="text-xs text-zinc-600 mt-1">{log.changes}</p>
                  </div>
                )) : (
                  <p className="text-sm text-zinc-500 text-center py-4">No audit logs available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with RoleGuard to restrict access to admin/teacher only
export default function GradesPage() {
  return (
    <RoleGuard 
      allowedRoles={['SUPER_ADMIN', 'ADMIN', 'TEACHER']}
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-100">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
            <ShieldAlert size={64} className="mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h1>
            <p className="text-zinc-600 mb-4">You do not have permission to access the grades management system.</p>
            <p className="text-sm text-zinc-500">Parents can view report cards from the &quot;View Reports&quot; page.</p>
          </div>
        </div>
      }
    >
      <GradesContent />
    </RoleGuard>
  );
}
