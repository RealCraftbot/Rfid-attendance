'use client';

import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';

type GradeLevel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

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
  class: string;
  term: string;
  academicYear: string;
  average: number;
  grade: GradeLevel;
  position: number;
  subjects: SubjectGrade[];
  attendance: number;
  remarks: string;
}

const mockReports: StudentReport[] = [
  {
    id: '1',
    student: 'John Doe',
    class: 'Grade 5A',
    term: 'Term 1',
    academicYear: '2024/2025',
    average: 85,
    grade: 'A',
    position: 1,
    attendance: 95,
    remarks: 'Excellent performance. Keep up the good work!',
    subjects: [
      { subject: 'Mathematics', testScore: 18, examScore: 72, totalScore: 90, grade: 'A', remarks: 'Excellent' },
      { subject: 'English', testScore: 16, examScore: 68, totalScore: 84, grade: 'B', remarks: 'Good' },
      { subject: 'Science', testScore: 17, examScore: 70, totalScore: 87, grade: 'A', remarks: 'Very Good' },
      { subject: 'Social Studies', testScore: 15, examScore: 65, totalScore: 80, grade: 'B', remarks: 'Good' },
      { subject: 'Computer', testScore: 19, examScore: 78, totalScore: 97, grade: 'A', remarks: 'Outstanding' },
    ]
  },
  {
    id: '2',
    student: 'Jane Smith',
    class: 'Grade 5A',
    term: 'Term 1',
    academicYear: '2024/2025',
    average: 78,
    grade: 'B',
    position: 2,
    attendance: 90,
    remarks: 'Good effort. Focus on Mathematics.',
    subjects: [
      { subject: 'Mathematics', testScore: 14, examScore: 60, totalScore: 74, grade: 'C', remarks: 'Fair' },
      { subject: 'English', testScore: 17, examScore: 70, totalScore: 87, grade: 'A', remarks: 'Very Good' },
      { subject: 'Science', testScore: 15, examScore: 68, totalScore: 83, grade: 'B', remarks: 'Good' },
      { subject: 'Social Studies', testScore: 14, examScore: 62, totalScore: 76, grade: 'B', remarks: 'Good' },
      { subject: 'Computer', testScore: 16, examScore: 72, totalScore: 88, grade: 'A', remarks: 'Excellent' },
    ]
  },
  {
    id: '3',
    student: 'Michael Johnson',
    class: 'Grade 5A',
    term: 'Term 1',
    academicYear: '2024/2025',
    average: 72,
    grade: 'C',
    position: 3,
    attendance: 85,
    remarks: 'Satisfactory. More effort needed.',
    subjects: [
      { subject: 'Mathematics', testScore: 12, examScore: 55, totalScore: 67, grade: 'C', remarks: 'Fair' },
      { subject: 'English', testScore: 14, examScore: 60, totalScore: 74, grade: 'C', remarks: 'Fair' },
      { subject: 'Science', testScore: 13, examScore: 58, totalScore: 71, grade: 'C', remarks: 'Fair' },
      { subject: 'Social Studies', testScore: 15, examScore: 65, totalScore: 80, grade: 'B', remarks: 'Good' },
      { subject: 'Computer', testScore: 14, examScore: 62, totalScore: 76, grade: 'B', remarks: 'Good' },
    ]
  },
];

const getGradeColor = (grade: GradeLevel) => {
  const colors: Record<GradeLevel, { bg: string; text: string }> = {
    A: { bg: 'bg-green-100', text: 'text-green-700' },
    B: { bg: 'bg-blue-100', text: 'text-blue-700' },
    C: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    D: { bg: 'bg-orange-100', text: 'text-orange-700' },
    E: { bg: 'bg-red-100', text: 'text-red-700' },
    F: { bg: 'bg-red-200', text: 'text-red-800' },
  };
  return colors[grade];
};

export default function ReportCardPage() {
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);
  const [termFilter, setTermFilter] = useState('Term 1');

  const filteredReports = mockReports.filter(r => 
    r.student.toLowerCase().includes(searchTerm.toLowerCase()) && r.term === termFilter
  );

  const classAverage = Math.round(mockReports.reduce((sum, r) => sum + r.average, 0) / mockReports.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Report Cards</h1>
          <p className="text-zinc-500 mt-1 text-sm sm:text-base">Academic performance and grades</p>
        </div>
        <button 
          onClick={() => setShowAddGradeModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          Add Grade
        </button>
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
            <span className="text-xs sm:text-sm text-zinc-500">Distinctions</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{mockReports.filter(r => r.grade === 'A').length}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Needs Improvement</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{mockReports.filter(r => r.grade === 'D' || r.grade === 'E' || r.grade === 'F').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search student..."
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
          <option>Term 1</option>
          <option>Term 2</option>
          <option>Term 3</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => {
          const gradeColor = getGradeColor(report.grade);
          return (
            <div 
              key={report.id} 
              className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="p-4 sm:p-6 border-b border-zinc-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                      {report.student.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">{report.student}</h3>
                      <p className="text-xs text-zinc-500">{report.class}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${gradeColor.bg} ${gradeColor.text}`}>
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
                    <p className="font-bold text-zinc-900">#{report.position}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Attendance</p>
                    <p className="font-bold text-zinc-900">{report.attendance}%</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 bg-zinc-50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-500">{report.term} • {report.academicYear}</span>
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
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full my-8">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Report Card</h3>
                <p className="text-sm text-zinc-500">{selectedReport.student} • {selectedReport.term} {selectedReport.academicYear}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-zinc-50 rounded-xl">
                  <p className="text-xs text-zinc-500 mb-1">Average</p>
                  <p className="text-2xl font-bold text-zinc-900">{selectedReport.average}%</p>
                </div>
                <div className="text-center p-4 bg-zinc-50 rounded-xl">
                  <p className="text-xs text-zinc-500 mb-1">Grade</p>
                  <span className={`inline-block px-4 py-1 rounded-full text-lg font-bold ${getGradeColor(selectedReport.grade).bg} ${getGradeColor(selectedReport.grade).text}`}>
                    {selectedReport.grade}
                  </span>
                </div>
                <div className="text-center p-4 bg-zinc-50 rounded-xl">
                  <p className="text-xs text-zinc-500 mb-1">Position</p>
                  <p className="text-2xl font-bold text-zinc-900">#{selectedReport.position}</p>
                </div>
              </div>

              {/* Subjects */}
              <h4 className="font-bold text-zinc-900 mb-3">Subject Performance</h4>
              <div className="space-y-3">
                {selectedReport.subjects.map((subject, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                    <div>
                      <p className="font-medium text-zinc-900">{subject.subject}</p>
                      <p className="text-xs text-zinc-500">Test: {subject.testScore}/20 • Exam: {subject.examScore}/80</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-zinc-900">{subject.totalScore}/100</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getGradeColor(subject.grade).bg} ${getGradeColor(subject.grade).text}`}>
                        {subject.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Remarks */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-2">Teacher&apos;s Remarks</h4>
                <p className="text-sm text-blue-800">{selectedReport.remarks}</p>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-200 flex gap-3">
              <button className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200 flex items-center justify-center gap-2">
                <Download size={18} />
                Download PDF
              </button>
              <button className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Grade Modal */}
      {showAddGradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-zinzinc-200 flex justify-between items-center">
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
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Subject</label>
                <select className="w-full px-4 py-3 border border-zinc-200 rounded-xl">
                  <option>Select Subject</option>
                  <option>Mathematics</option>
                  <option>English</option>
                  <option>Science</option>
                  <option>Social Studies</option>
                  <option>Computer</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Test Score (/20)</label>
                  <input type="number" className="w-full px-4 py-3 border border-zinc-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Exam Score (/80)</label>
                  <input type="number" className="w-full px-4 py-3 border border-zinc-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Remarks</label>
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
