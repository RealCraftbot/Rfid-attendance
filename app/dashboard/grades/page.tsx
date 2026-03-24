'use client';

import React, { useState, useRef } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award,
  TrendingUp,
  Plus,
  X,
  Search,
  Download,
  Star,
  FileText,
  Printer,
  Upload,
  Camera
} from 'lucide-react';

type GradeLevel = 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6' | 'D7' | 'E8' | 'F9';

interface SubjectGrade {
  subject: string;
  testScore: number;
  examScore: number;
  totalScore: number;
  grade: GradeLevel;
  remarks: string;
}

interface StudentReport {
  id: string;
  student: string;
  studentImage?: string;
  class: string;
  term: number;
  academicYear: string;
  average: number;
  grade: GradeLevel;
  position: number;
  subjects: SubjectGrade[];
  attendance: number;
  classSize: number;
  remarks: string;
  principalName: string;
  schoolName: string;
  schoolLogo?: string;
}

const NIGERIAN_PRIMARY_SUBJECTS = [
  'Mathematics',
  'English',
  'Basic Science',
  'Social Studies',
  'Civic Education',
  'Computer Studies',
  'Agricultural Science',
  'Home Economics',
  'French',
  'Christian Religious Studies',
  'Islamic Studies',
  ' Yoruba Language',
  'Hausa Language',
  'Igbo Language',
  'Fine Arts',
  'Music',
  'Physical & Health Education',
];

const NIGERIAN_JSS_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Basic Science',
  'Basic Technology',
  'Social Studies',
  'Civic Education',
  'Computer Studies',
  'Agricultural Science',
  'Home Economics',
  'French',
  'Christian Religious Studies',
  'Islamic Studies',
  'Yoruba Language',
  'Hausa Language',
  'Igbo Language',
  'Fine Arts',
  'Music',
  'Physical & Health Education',
  'Business Studies',
];

const NIGERIAN_SSS_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature in English',
  'Civic Education',
  'Computer Science',
  'Agricultural Science',
  'Financial Accounting',
  'Commerce',
  'Geography',
  'History',
  'Christian Religious Studies',
  'Islamic Studies',
  'Yoruba Language',
  'Hausa Language',
  'Igbo Language',
  'French',
  'Government',
  'Marketing',
  'Office Practice',
];

const getGradeInfo = (score: number): { grade: GradeLevel; remark: string; color: string } => {
  if (score >= 90) return { grade: 'A1', remark: 'Excellent', color: 'bg-green-100 text-green-800' };
  if (score >= 80) return { grade: 'B2', remark: 'Very Good', color: 'bg-green-100 text-green-700' };
  if (score >= 70) return { grade: 'B3', remark: 'Good', color: 'bg-blue-100 text-blue-700' };
  if (score >= 65) return { grade: 'C4', remark: 'Credit', color: 'bg-blue-100 text-blue-600' };
  if (score >= 60) return { grade: 'C5', remark: 'Credit', color: 'bg-cyan-100 text-cyan-700' };
  if (score >= 55) return { grade: 'C6', remark: 'Credit', color: 'bg-cyan-100 text-cyan-600' };
  if (score >= 50) return { grade: 'D7', remark: 'Pass', color: 'bg-yellow-100 text-yellow-700' };
  if (score >= 45) return { grade: 'E8', remark: 'Pass', color: 'bg-orange-100 text-orange-700' };
  return { grade: 'F9', remark: 'Fail', color: 'bg-red-100 text-red-700' };
};

const mockReports: StudentReport[] = [
  {
    id: '1',
    student: 'Chukwuemeka Okafor',
    class: 'JSS 3A',
    term: 1,
    academicYear: '2025/2026',
    average: 87,
    grade: 'B2',
    position: 1,
    attendance: 95,
    classSize: 45,
    remarks: 'Excellent performance. Keep up the good work!',
    principalName: 'Mrs. Ngozi Adeyemi',
    schoolName: 'Greenfield Academy',
    subjects: [
      { subject: 'Mathematics', testScore: 28, examScore: 58, totalScore: 86, grade: 'B2', remarks: 'Very Good' },
      { subject: 'English Language', testScore: 26, examScore: 55, totalScore: 81, grade: 'B2', remarks: 'Very Good' },
      { subject: 'Basic Science', testScore: 27, examScore: 60, totalScore: 87, grade: 'B2', remarks: 'Very Good' },
      { subject: 'Computer Studies', testScore: 29, examScore: 65, totalScore: 94, grade: 'A1', remarks: 'Excellent' },
      { subject: 'Social Studies', testScore: 25, examScore: 54, totalScore: 79, grade: 'B3', remarks: 'Good' },
    ]
  },
  {
    id: '2',
    student: 'Adaeze Nwosu',
    class: 'JSS 3A',
    term: 1,
    academicYear: '2025/2026',
    average: 78,
    grade: 'B3',
    position: 2,
    attendance: 92,
    classSize: 45,
    remarks: 'Good effort. Focus on Mathematics.',
    principalName: 'Mrs. Ngozi Adeyemi',
    schoolName: 'Greenfield Academy',
    subjects: [
      { subject: 'Mathematics', testScore: 22, examScore: 48, totalScore: 70, grade: 'C4', remarks: 'Credit' },
      { subject: 'English Language', testScore: 26, examScore: 55, totalScore: 81, grade: 'B2', remarks: 'Very Good' },
      { subject: 'Basic Science', testScore: 25, examScore: 52, totalScore: 77, grade: 'B3', remarks: 'Good' },
      { subject: 'Computer Studies', testScore: 27, examScore: 60, totalScore: 87, grade: 'B2', remarks: 'Very Good' },
      { subject: 'Social Studies', testScore: 24, examScore: 50, totalScore: 74, grade: 'C4', remarks: 'Credit' },
    ]
  },
  {
    id: '3',
    student: 'Oluwaseun Adebayo',
    class: 'SS 2 Science',
    term: 1,
    academicYear: '2025/2026',
    average: 72,
    grade: 'C4',
    position: 3,
    attendance: 88,
    classSize: 35,
    remarks: 'Satisfactory. More effort needed in Physics.',
    principalName: 'Mrs. Ngozi Adeyemi',
    schoolName: 'Greenfield Academy',
    subjects: [
      { subject: 'Mathematics', testScore: 20, examScore: 45, totalScore: 65, grade: 'C4', remarks: 'Credit' },
      { subject: 'English Language', testScore: 22, examScore: 50, totalScore: 72, grade: 'C4', remarks: 'Credit' },
      { subject: 'Physics', testScore: 18, examScore: 38, totalScore: 56, grade: 'C5', remarks: 'Credit' },
      { subject: 'Chemistry', testScore: 20, examScore: 48, totalScore: 68, grade: 'C4', remarks: 'Credit' },
      { subject: 'Biology', testScore: 23, examScore: 52, totalScore: 75, grade: 'B3', remarks: 'Good' },
      { subject: 'Economics', testScore: 24, examScore: 55, totalScore: 79, grade: 'B3', remarks: 'Good' },
    ]
  },
];

const NIGERIAN_CLASSES = [
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SS 1', 'SS 2', 'SS 3'
];

export default function ReportCardPage() {
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);
  const [termFilter, setTermFilter] = useState('1');
  const [classFilter, setClassFilter] = useState('all');
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredReports = mockReports.filter(r => 
    r.student.toLowerCase().includes(searchTerm.toLowerCase()) &&
    r.term === parseInt(termFilter) &&
    (classFilter === 'all' || r.class.startsWith(classFilter))
  );

  const classAverage = Math.round(mockReports.reduce((sum, r) => sum + r.average, 0) / mockReports.length);

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

  const generatePDF = (report: StudentReport) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const gradeInfo = getGradeInfo(report.average);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Card - ${report.student}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #1e40af; padding-bottom: 15px; }
          .logo { width: 80px; height: 80px; object-fit: contain; margin-bottom: 10px; }
          .school-name { font-size: 24px; font-weight: bold; color: #1e40af; }
          .school-address { font-size: 12px; color: #666; }
          .title { font-size: 18px; font-weight: bold; margin: 15px 0 5px; text-align: center; }
          .student-info { display: flex; justify-content: space-between; margin: 15px 0; padding: 10px; background: #f3f4f6; border-radius: 8px; }
          .info-item { text-align: center; }
          .info-label { font-size: 11px; color: #666; }
          .info-value { font-size: 14px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px 5px; text-align: center; font-size: 12px; }
          th { background: #1e40af; color: white; }
          tr:nth-child(even) { background: #f9fafb; }
          .score-high { background: #dcfce7 !important; }
          .score-low { background: #fee2e2 !important; }
          .summary { display: flex; justify-content: space-around; margin: 20px 0; padding: 15px; background: #eff6ff; border-radius: 8px; }
          .summary-item { text-align: center; }
          .remarks { margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; }
          .signature-line { border-top: 1px solid #333; width: 200px; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${schoolLogo ? `<img src="${schoolLogo}" class="logo" alt="School Logo" />` : ''}
          <div class="school-name">${report.schoolName}</div>
          <div class="school-address">123 Education Street, Lagos, Nigeria | Tel: 01-234-5678</div>
        </div>
        
        <div class="title">TERMINAL REPORT</div>
        
        <div class="student-info">
          <div class="info-item">
            <div class="info-label">STUDENT NAME</div>
            <div class="info-value">${report.student}</div>
          </div>
          <div class="info-item">
            <div class="info-label">CLASS</div>
            <div class="info-value">${report.class}</div>
          </div>
          <div class="info-item">
            <div class="info-label">TERM</div>
            <div class="info-value">${report.term}</div>
          </div>
          <div class="info-item">
            <div class="info-label">SESSION</div>
            <div class="info-value">${report.academicYear}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Test (30)</th>
              <th>Exam (70)</th>
              <th>Total (100)</th>
              <th>Grade</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            ${report.subjects.map(s => {
              const info = getGradeInfo(s.totalScore);
              return `
                <tr class="${s.totalScore >= 75 ? 'score-high' : s.totalScore < 50 ? 'score-low' : ''}">
                  <td style="text-align: left;">${s.subject}</td>
                  <td>${s.testScore}</td>
                  <td>${s.examScore}</td>
                  <td><strong>${s.totalScore}</strong></td>
                  <td><strong>${info.grade}</strong></td>
                  <td>${info.remark}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="summary-item">
            <div class="info-label">AVERAGE SCORE</div>
            <div class="info-value" style="font-size: 24px;">${report.average}%</div>
          </div>
          <div class="summary-item">
            <div class="info-label">OVERALL GRADE</div>
            <div class="info-value" style="font-size: 24px;">${report.grade}</div>
          </div>
          <div class="summary-item">
            <div class="info-label">POSITION</div>
            <div class="info-value" style="font-size: 24px;">${report.position} / ${report.classSize}</div>
          </div>
          <div class="summary-item">
            <div class="info-label">ATTENDANCE</div>
            <div class="info-value" style="font-size: 24px;">${report.attendance}%</div>
          </div>
        </div>
        
        <div class="remarks">
          <strong>Class Teacher's Comment:</strong><br/>
          ${report.remarks}
        </div>
        
        <div class="footer">
          <div>
            <div class="signature-line">Class Teacher</div>
          </div>
          <div>
            <div class="signature-line">Principal</div>
          </div>
          <div>
            <div class="signature-line">Date</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Report Cards</h1>
          <p className="text-zinc-500 mt-1 text-sm sm:text-base">Nigerian curriculum grades & academic performance</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-white text-zinc-700 border border-zinc-200 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-50"
          >
            <Upload size={18} />
            Upload Logo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <button 
            onClick={() => setShowAddGradeModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 flex-1 sm:flex-none justify-center"
          >
            <Plus size={18} />
            Add Grade
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award size={20} className="text-green-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Class Average</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{classAverage}%</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap size={20} className="text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Total Students</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{mockReports.length}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star size={20} className="text-purple-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Distinctions (A1-B2)</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{mockReports.filter(r => ['A1', 'B2'].includes(r.grade)).length}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Needs Improvement</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{mockReports.filter(r => ['D7', 'E8', 'F9'].includes(r.grade)).length}</p>
        </div>
      </div>

      {/* Nigerian Curriculum Info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h3 className="font-bold text-lg mb-2">Nigerian National Curriculum</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-blue-200">Primary</p>
            <p className="font-medium">Primary 1 - 6</p>
          </div>
          <div>
            <p className="text-blue-200">Junior Secondary</p>
            <p className="font-medium">JSS 1 - 3</p>
          </div>
          <div>
            <p className="text-blue-200">Senior Secondary</p>
            <p className="font-medium">SS 1 - 3</p>
          </div>
          <div>
            <p className="text-blue-200">Grading</p>
            <p className="font-medium">A1 (90-100) - F9 (0-44)</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm"
          />
        </div>
        <select
          value={termFilter}
          onChange={(e) => setTermFilter(e.target.value)}
          className="px-4 py-2 border border-zinc-200 rounded-lg text-sm"
        >
          <option value="1">First Term</option>
          <option value="2">Second Term</option>
          <option value="3">Third Term</option>
        </select>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-4 py-2 border border-zinc-200 rounded-lg text-sm"
        >
          <option value="all">All Classes</option>
          <option value="Primary">Primary School</option>
          <option value="JSS">Junior Secondary</option>
          <option value="SS">Senior Secondary</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => {
          const gradeColor = getGradeInfo(report.average).color;
          return (
            <div 
              key={report.id} 
              className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="p-4 sm:p-6 border-b border-zinc-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {report.studentImage ? (
                      <img src={report.studentImage} className="w-12 h-12 rounded-full object-cover" alt={report.student} />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-lg">
                        {report.student.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-zinc-900">{report.student}</h3>
                      <p className="text-xs text-zinc-500">{report.class}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${gradeColor}`}>
                    {report.grade}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-zinc-500">Average</p>
                    <p className="font-bold text-zinc-900">{report.average}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Position</p>
                    <p className="font-bold text-zinc-900">#{report.position}/{report.classSize}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Attendance</p>
                    <p className="font-bold text-zinc-900">{report.attendance}%</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 bg-zinc-50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-500">Term {report.term} • {report.academicYear}</span>
                  <button className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700">
                    <FileText size={14} />
                    View Report
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Report Card</h3>
                <p className="text-sm text-zinc-500">{selectedReport.student} • {selectedReport.class}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                {schoolLogo && (
                  <img src={schoolLogo} className="w-16 h-16 mx-auto mb-2 object-contain" alt="School Logo" />
                )}
                <h2 className="text-xl font-bold text-blue-700">{selectedReport.schoolName}</h2>
                <p className="text-sm text-zinc-500">123 Education Street, Lagos, Nigeria</p>
                <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-bold">
                  TERMINAL REPORT
                </div>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-zinc-50 rounded-xl">
                <div className="text-center">
                  <p className="text-xs text-zinc-500">Student Name</p>
                  <p className="font-bold text-zinc-900">{selectedReport.student}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500">Class</p>
                  <p className="font-bold text-zinc-900">{selectedReport.class}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500">Term</p>
                  <p className="font-bold text-zinc-900">{selectedReport.term}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500">Session</p>
                  <p className="font-bold text-zinc-900">{selectedReport.academicYear}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-xs text-zinc-500 mb-1">Average</p>
                  <p className="text-2xl font-bold text-green-700">{selectedReport.average}%</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs text-zinc-500 mb-1">Grade</p>
                  <span className={`inline-block px-4 py-1 rounded-full text-lg font-bold ${getGradeInfo(selectedReport.average).color}`}>
                    {selectedReport.grade}
                  </span>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <p className="text-xs text-zinc-500 mb-1">Position</p>
                  <p className="text-2xl font-bold text-purple-700">{selectedReport.position}/{selectedReport.classSize}</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <p className="text-xs text-zinc-500 mb-1">Attendance</p>
                  <p className="text-2xl font-bold text-amber-700">{selectedReport.attendance}%</p>
                </div>
              </div>

              {/* Subjects */}
              <h4 className="font-bold text-zinc-900 mb-3">Subject Performance</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-100">
                      <th className="px-3 py-2 text-left font-bold text-zinc-700">Subject</th>
                      <th className="px-3 py-2 text-center font-bold text-zinc-700">Test/30</th>
                      <th className="px-3 py-2 text-center font-bold text-zinc-700">Exam/70</th>
                      <th className="px-3 py-2 text-center font-bold text-zinc-700">Total/100</th>
                      <th className="px-3 py-2 text-center font-bold text-zinc-700">Grade</th>
                      <th className="px-3 py-2 text-left font-bold text-zinc-700">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.subjects.map((subject, idx) => {
                      const info = getGradeInfo(subject.totalScore);
                      return (
                        <tr key={idx} className={`border-b border-zinc-100 ${subject.totalScore >= 75 ? 'bg-green-50' : subject.totalScore < 50 ? 'bg-red-50' : ''}`}>
                          <td className="px-3 py-2 font-medium">{subject.subject}</td>
                          <td className="px-3 py-2 text-center">{subject.testScore}</td>
                          <td className="px-3 py-2 text-center">{subject.examScore}</td>
                          <td className="px-3 py-2 text-center font-bold">{subject.totalScore}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${info.color}`}>
                              {info.grade}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-zinc-600">{info.remark}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Remarks */}
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-800 mb-2">Class Teacher&apos;s Comments</h4>
                <p className="text-sm text-amber-900">{selectedReport.remarks}</p>
              </div>

              {/* Signatures */}
              <div className="mt-6 flex justify-between">
                <div className="text-center">
                  <div className="border-b border-zinc-400 w-40 mb-1"></div>
                  <p className="text-xs text-zinc-500">Class Teacher</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-zinc-400 w-40 mb-1"></div>
                  <p className="text-xs text-zinc-500">Principal</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-zinc-400 w-32 mb-1"></div>
                  <p className="text-xs text-zinc-500">Date</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-200 flex gap-3">
              <button 
                onClick={() => generatePDF(selectedReport)}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print / Download PDF
              </button>
              <button className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700">
                Share to Parent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Grade Modal */}
      {showAddGradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-zinc-900">Add Student Grade</h3>
              <button onClick={() => setShowAddGradeModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Student</label>
                <select className="w-full px-4 py-3 border border-zinc-200 rounded-xl">
                  <option>Select Student</option>
                  {mockReports.map(r => (
                    <option key={r.id}>{r.student}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Class</label>
                <select className="w-full px-4 py-3 border border-zinc-200 rounded-xl">
                  <option>Select Class</option>
                  {NIGERIAN_CLASSES.map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Subject</label>
                <select className="w-full px-4 py-3 border border-zinc-200 rounded-xl">
                  <option>Select Subject</option>
                  <optgroup label="Core Subjects">
                    <option>Mathematics</option>
                    <option>English Language</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Biology</option>
                    <option>Economics</option>
                  </optgroup>
                  <optgroup label="Languages">
                    <option>Yoruba Language</option>
                    <option>Hausa Language</option>
                    <option>Igbo Language</option>
                    <option>French</option>
                  </optgroup>
                  <optgroup label="Others">
                    <option>Computer Studies</option>
                    <option>Agricultural Science</option>
                    <option>Business Studies</option>
                  </optgroup>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Test Score (/30)</label>
                  <input type="number" max="30" className="w-full px-4 py-3 border border-zinc-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Exam Score (/70)</label>
                  <input type="number" max="70" className="w-full px-4 py-3 border border-zinc-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Teacher&apos;s Remarks</label>
                <textarea className="w-full px-4 py-3 border border-zinc-200 rounded-xl" rows={2} placeholder="Optional remarks..."></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddGradeModal(false)} className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
