'use client';


import React, { useState } from 'react';
import { 
  FileText,
  Printer,
  X,
  Eye,
  GraduationCap,
  User,
  Calendar,
  TrendingUp,
  Wallet
} from 'lucide-react';

// Types
interface ChildReport {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentImage?: string;
  term: number;
  session: string;
  average: number;
  grade: string;
  attendance: number;
  createdAt: string;
  teacherName: string;
}

// Mock data - parent's children
const myChildren = [
  { 
    id: 's1', 
    name: 'Chukwuemeka Okafor', 
    class: 'Primary 5', 
    admissionNo: 'GA/2023/001',
    imageUrl: null as string | null,
  },
  { 
    id: 's2', 
    name: 'Adaeze Nwosu', 
    class: 'Primary 3', 
    admissionNo: 'GA/2023/002',
    imageUrl: null as string | null,
  },
];

// Mock reports
const mockReports: ChildReport[] = [
  {
    id: 'r1',
    studentId: 's1',
    studentName: 'Chukwuemeka Okafor',
    studentClass: 'Primary 5',
    term: 1,
    session: '2025/2026',
    average: 88,
    grade: 'A',
    attendance: 93,
    createdAt: '2025-12-15',
    teacherName: 'Mrs. Adeyemi',
  },
  {
    id: 'r2',
    studentId: 's1',
    studentName: 'Chukwuemeka Okafor',
    studentClass: 'Primary 5',
    term: 2,
    session: '2024/2025',
    average: 85,
    grade: 'A',
    attendance: 95,
    createdAt: '2025-04-15',
    teacherName: 'Mrs. Adeyemi',
  },
  {
    id: 'r3',
    studentId: 's2',
    studentName: 'Adaeze Nwosu',
    studentClass: 'Primary 3',
    term: 1,
    session: '2025/2026',
    average: 92,
    grade: 'A',
    attendance: 98,
    createdAt: '2025-12-15',
    teacherName: 'Mr. Okonkwo',
  },
];

// Mock fees for children
const mockFees = [
  { childId: 's1', term: 'First Term', amount: 55000, paid: 55000, status: 'PAID', dueDate: '2025-09-15' },
  { childId: 's1', term: 'Second Term', amount: 55000, paid: 30000, status: 'PARTIAL', dueDate: '2026-01-15' },
  { childId: 's2', term: 'First Term', amount: 50000, paid: 50000, status: 'PAID', dueDate: '2025-09-15' },
];

const schoolInfo = {
  name: 'Greenfield Academy',
  address: '123 Education Street, Lagos, Nigeria',
  phone: '+234 801 234 5678',
  email: 'info@greenfield.edu.ng',
  motto: 'Education for Excellence',
};

export default function ParentViewReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ChildReport | null>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'fees'>('reports');
  const [selectedChild, setSelectedChild] = useState<string>('all');

  const filteredReports = selectedChild === 'all' 
    ? mockReports 
    : mockReports.filter(r => r.studentId === selectedChild);

  const filteredFees = selectedChild === 'all'
    ? mockFees
    : mockFees.filter(f => f.childId === selectedChild);

  const getGradeColor = (grade: string) => {
    switch(grade) {
      case 'A': return 'bg-green-100 text-green-700';
      case 'B': return 'bg-blue-100 text-blue-700';
      case 'C': return 'bg-yellow-100 text-yellow-700';
      case 'D': return 'bg-orange-100 text-orange-700';
      case 'E': return 'bg-pink-100 text-pink-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">My Children</h1>
          <p className="text-zinc-500 mt-1 text-xs sm:text-sm">View report cards and fees</p>
        </div>
      </div>

      {/* Child Selector */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
        <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Select Child</label>
        <select 
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
        >
          <option value="all">All Children</option>
          {myChildren.map(child => (
            <option key={child.id} value={child.id}>{child.name} - {child.class}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200">
        {(['reports', 'fees'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-bold capitalize ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {tab === 'reports' ? (
              <span className="flex items-center justify-center gap-2">
                <FileText size={16} />
                Report Cards
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Wallet size={16} />
                School Fees
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-3 sm:space-y-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-zinc-200">
              <FileText size={48} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500 text-sm">No reports available</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-base sm:text-lg">
                      {report.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 text-sm sm:text-base">{report.studentName}</p>
                      <p className="text-xs text-zinc-500">{report.studentClass} • Term {report.term}</p>
                      <p className="text-xs text-zinc-400">{report.session}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="text-center">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${getGradeColor(report.grade)}`}>
                        {report.grade}
                      </span>
                      <p className="text-xs text-zinc-500 mt-1">{report.average}%</p>
                    </div>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-blue-700 ml-auto"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-100 flex justify-between items-center text-xs text-zinc-500">
                  <span>Teacher: {report.teacherName}</span>
                  <span>Created: {report.createdAt}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === 'fees' && (
        <div className="space-y-3 sm:space-y-4">
          {filteredFees.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-zinc-200">
              <Wallet size={48} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500 text-sm">No fee records</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-bold text-zinc-600">Child</th>
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-bold text-zinc-600">Term</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-bold text-zinc-600">Amount</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-bold text-zinc-600">Paid</th>
                      <th className="text-center py-2 sm:py-3 px-3 sm:px-4 font-bold text-zinc-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredFees.map((fee, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50">
                        <td className="py-2 sm:py-3 px-3 sm:px-4">
                          <p className="font-medium text-zinc-900">
                            {myChildren.find(c => c.id === fee.childId)?.name}
                          </p>
                        </td>
                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-zinc-600">{fee.term}</td>
                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-right font-medium">₦{fee.amount.toLocaleString()}</td>
                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-green-600">₦{fee.paid.toLocaleString()}</td>
                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            fee.status === 'PAID' ? 'bg-green-100 text-green-700' :
                            fee.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {fee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="p-3 sm:p-4 border-b border-zinc-200 flex justify-between items-center bg-blue-50">
              <h3 className="text-base sm:text-lg font-bold text-blue-900">Report Card</h3>
              <button onClick={() => setSelectedReport(null)} className="p-1.5 sm:p-2 hover:bg-blue-100 rounded-lg">
                <X size={18} className="sm:w-5 sm:h-5 text-blue-600" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="border-2 border-blue-600 p-4 sm:p-6 bg-white">
                {/* Header */}
                <div className="text-center border-b-2 border-blue-600 pb-3 sm:pb-4 mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-blue-700">{schoolInfo.name}</h2>
                  <p className="text-[10px] sm:text-xs text-zinc-600">{schoolInfo.address}</p>
                  <div className="mt-2 inline-block border-2 border-blue-600 px-3 sm:px-4 py-1">
                    <span className="font-bold text-xs sm:text-sm">Term {selectedReport.term} Report</span>
                  </div>
                </div>

                {/* Student Info */}
                <div className="bg-blue-50 p-3 rounded-lg mb-3 sm:mb-4">
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div><strong>Name:</strong> {selectedReport.studentName}</div>
                    <div><strong>Class:</strong> {selectedReport.studentClass}</div>
                    <div><strong>Session:</strong> {selectedReport.session}</div>
                    <div><strong>Teacher:</strong> {selectedReport.teacherName}</div>
                  </div>
                </div>

                {/* Performance */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-lg text-center">
                    <p className="text-[10px] sm:text-xs text-blue-600">Average</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-700">{selectedReport.average}%</p>
                  </div>
                  <div className="bg-green-100 p-2 sm:p-3 rounded-lg text-center">
                    <p className="text-[10px] sm:text-xs text-green-600">Grade</p>
                    <p className="text-lg sm:text-xl font-bold text-green-700">{selectedReport.grade}</p>
                  </div>
                  <div className="bg-purple-100 p-2 sm:p-3 rounded-lg text-center">
                    <p className="text-[10px] sm:text-xs text-purple-600">Attendance</p>
                    <p className="text-lg sm:text-xl font-bold text-purple-700">{selectedReport.attendance}%</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-center text-zinc-500">
                  For detailed subject breakdown, please contact the school.
                </p>
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-zinc-200">
              <button onClick={() => window.print()} className="w-full py-2.5 sm:py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 text-xs sm:text-sm">
                <Printer size={16} />
                Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
