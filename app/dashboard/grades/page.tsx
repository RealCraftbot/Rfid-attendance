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
  Camera,
  Wallet
} from 'lucide-react';

type GradeLevel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
type RatingLevel = 1 | 2 | 3 | 4 | 5;

interface SubjectGrade {
  subject: string;
  firstCA: number;
  secondCA: number;
  exam: number;
  total: number;
  grade: GradeLevel;
  remarks: string;
}

interface AffectiveDomain {
  punctuality: RatingLevel;
  attendance: RatingLevel;
  selfControl: RatingLevel;
  neatness: RatingLevel;
  responsibility: RatingLevel;
  diligence: RatingLevel;
  attentiveness: RatingLevel;
  leadership: RatingLevel;
  accuracy: RatingLevel;
  sports: RatingLevel;
}

interface StudentReport {
  id: string;
  name: string;
  class: string;
  gender: 'Male' | 'Female';
  term: number;
  session: string;
  noInClass: number;
  dateOfBirth: string;
  timesSchoolOpened: number;
  timesPresent: number;
  timesAbsent: number;
  closingDate: string;
  resumptionDate: string;
  overallTotal: number;
  average: number;
  percentage: number;
  position: number;
  subjects: SubjectGrade[];
  affective: AffectiveDomain;
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
}

// Nigerian Primary School Subjects
const PRIMARY_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Igbo Language',
  'Social Studies',
  'Health Habit',
  'General Science',
  'C.R.S',
  'Food & Nutrition',
  'Writing',
  'Poem',
  'Drawing / Colouring',
  'Dictation',
];

// Grading Keys
const GRADING_KEYS = [
  { range: '70 & Above', grade: 'A', remark: 'Excellent' },
  { range: '60-69', grade: 'B', remark: 'Very Good' },
  { range: '50-59', grade: 'C', remark: 'Good' },
  { range: '45-49', grade: 'D', remark: 'Fair' },
  { range: '40-44', grade: 'E', remark: 'Poor' },
  { range: '0-39', grade: 'F', remark: 'Fail' },
];

// Rating Keys
const RATING_KEYS = [
  { level: 5, desc: 'Excellent' },
  { level: 4, desc: 'Very Good' },
  { level: 3, desc: 'Good' },
  { level: 2, desc: 'Poor' },
  { level: 1, desc: 'Very Poor' },
];

const getGradeInfo = (score: number): { grade: GradeLevel; remark: string } => {
  if (score >= 70) return { grade: 'A', remark: 'Excellent' };
  if (score >= 60) return { grade: 'B', remark: 'Very Good' };
  if (score >= 50) return { grade: 'C', remark: 'Good' };
  if (score >= 45) return { grade: 'D', remark: 'Fair' };
  if (score >= 40) return { grade: 'E', remark: 'Poor' };
  return { grade: 'F', remark: 'Fail' };
};

const calculateSubjectGrade = (firstCA: number, secondCA: number, exam: number): SubjectGrade => {
  const total = firstCA + secondCA + exam;
  const info = getGradeInfo(total);
  return {
    subject: '',
    firstCA,
    secondCA,
    exam,
    total,
    grade: info.grade,
    remarks: info.remark,
  };
};

const mockReports: StudentReport[] = [
  {
    id: '1',
    name: 'Chukwuemeka Okafor',
    class: 'Primary 5',
    gender: 'Male',
    term: 1,
    session: '2025/2026',
    noInClass: 45,
    dateOfBirth: '2015-03-12',
    timesSchoolOpened: 120,
    timesPresent: 112,
    timesAbsent: 8,
    closingDate: '2025-12-20',
    resumptionDate: '2026-01-06',
    overallTotal: 1056,
    average: 88,
    percentage: 88,
    position: 3,
    subjects: [
      { subject: 'Mathematics', firstCA: 18, secondCA: 18, exam: 56, total: 92, grade: 'A', remarks: 'Excellent' },
      { subject: 'English Language', firstCA: 16, secondCA: 17, exam: 52, total: 85, grade: 'A', remarks: 'Excellent' },
      { subject: 'Igbo Language', firstCA: 15, secondCA: 16, exam: 48, total: 79, grade: 'B', remarks: 'Very Good' },
      { subject: 'Social Studies', firstCA: 14, secondCA: 15, exam: 45, total: 74, grade: 'B', remarks: 'Very Good' },
      { subject: 'Health Habit', firstCA: 17, secondCA: 18, exam: 54, total: 89, grade: 'A', remarks: 'Excellent' },
      { subject: 'General Science', firstCA: 16, secondCA: 17, exam: 53, total: 86, grade: 'A', remarks: 'Excellent' },
      { subject: 'C.R.S', firstCA: 18, secondCA: 18, exam: 55, total: 91, grade: 'A', remarks: 'Excellent' },
      { subject: 'Food & Nutrition', firstCA: 15, secondCA: 16, exam: 47, total: 78, grade: 'B', remarks: 'Very Good' },
      { subject: 'Writing', firstCA: 17, secondCA: 17, exam: 51, total: 85, grade: 'A', remarks: 'Excellent' },
      { subject: 'Poem', firstCA: 14, secondCA: 15, exam: 46, total: 75, grade: 'B', remarks: 'Very Good' },
      { subject: 'Drawing / Colouring', firstCA: 16, secondCA: 16, exam: 50, total: 82, grade: 'A', remarks: 'Excellent' },
      { subject: 'Dictation', firstCA: 15, secondCA: 15, exam: 45, total: 75, grade: 'B', remarks: 'Very Good' },
    ],
    affective: {
      punctuality: 4,
      attendance: 4,
      selfControl: 5,
      neatness: 5,
      responsibility: 5,
      diligence: 5,
      attentiveness: 4,
      leadership: 4,
      accuracy: 4,
      sports: 5,
    },
    classTeacherRemark: 'Chukwuemeka is a diligent student who shows great promise. He participates actively in class and maintains excellent conduct.',
    headTeacherRemark: 'A well-behaved and hardworking pupil. Keep up the good work.',
    fees: {
      tuition: 50000,
      exam: 1000,
      sport: 233,
      lesson: 1300,
      other: 4500,
      outstanding: 5000,
      total: 65533,
    },
  },
];

export default function ReportCardPage() {
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const schoolInfo = {
    name: 'GRACELAND ACADEMY NANDO',
    address: 'ALONG ISINYI/IGBARIAM ROAD BESIDE OYE MARKET ANAMBRA EAST L.G, ANAMBRA STATE',
    email: 'gracelandacademy950@gmail.com',
    phone: '07036183613, 07032440593',
    motto: 'EDUCATION FOR EXCELLENCE',
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

  const generatePDF = (report: StudentReport) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const termNames = ['', 'FIRST', 'SECOND', 'THIRD'];
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Card - ${report.name}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            max-width: 900px; 
            margin: 0 auto;
            font-size: 11px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #000; 
            padding-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
          }
          .logo { width: 70px; height: 70px; object-fit: contain; }
          .school-info { text-align: center; flex: 1; }
          .school-name { font-size: 22px; font-weight: bold; color: #c00; margin-bottom: 3px; }
          .school-address { font-size: 9px; color: #333; }
          .school-contact { font-size: 9px; color: #333; }
          .motto { font-size: 12px; font-weight: bold; color: #c00; margin-top: 3px; }
          .title { 
            font-size: 16px; 
            font-weight: bold; 
            text-align: center; 
            margin: 15px 0 10px;
            border: 2px solid #000;
            padding: 5px;
            display: inline-block;
            width: 100%;
          }
          .student-info { 
            border: 1px solid #000; 
            padding: 8px; 
            margin-bottom: 10px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
          }
          .info-row {
            display: flex;
            gap: 5px;
            margin-bottom: 3px;
          }
          .info-label { font-weight: bold; font-size: 10px; }
          .info-value { border-bottom: 1px solid #000; flex: 1; min-width: 60px; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0; 
            font-size: 9px;
          }
          th, td { 
            border: 1px solid #000; 
            padding: 3px; 
            text-align: center; 
          }
          th { 
            background: #f0f0f0; 
            font-weight: bold;
            font-size: 8px;
          }
          .subject-col { text-align: left; width: 25%; }
          .grade-A { background: #90EE90; }
          .grade-B { background: #ADD8E6; }
          .grade-C { background: #FFFFE0; }
          .grade-D { background: #FFE4B5; }
          .grade-E { background: #FFB6C1; }
          .grade-F { background: #FF6B6B; }
          .section-title {
            background: #c00;
            color: white;
            text-align: center;
            font-weight: bold;
            font-size: 10px;
            padding: 3px;
            margin: 10px 0 5px;
          }
          .three-col {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            margin: 10px 0;
          }
          .domain-table, .keys-table, .bill-table {
            border: 1px solid #000;
            font-size: 9px;
          }
          .domain-table th, .keys-table th, .bill-table th {
            background: #f0f0f0;
            font-size: 8px;
          }
          .remarks-section {
            margin-top: 15px;
          }
          .remark-line {
            display: flex;
            margin-bottom: 8px;
            align-items: flex-end;
          }
          .remark-label { 
            font-weight: bold; 
            font-size: 10px;
            min-width: 150px;
          }
          .remark-value { 
            border-bottom: 1px solid #000; 
            flex: 1;
            min-height: 20px;
          }
          .signature-row {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 30px;
            padding-top: 3px;
            font-size: 10px;
          }
          @media print { 
            body { padding: 0; font-size: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${schoolLogo ? `<img src="${schoolLogo}" class="logo" alt="School Logo" />` : '<div class="logo" style="width:70px;height:70px;background:#f0f0f0;"></div>'}
          <div class="school-info">
            <div class="school-name">${schoolInfo.name}</div>
            <div class="school-address">${schoolInfo.address}</div>
            <div class="school-contact">${schoolInfo.email}, ${schoolInfo.phone}</div>
            <div class="motto">MOTTO: ${schoolInfo.motto}</div>
          </div>
          <div style="width:70px;height:70px;background:#f0f0f0;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:10px;color:#999;">Photo</span>
          </div>
        </div>
        
        <div class="title">${termNames[report.term]} TERM REPORT SHEET</div>
        
        <div class="student-info">
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">NAME:</span>
              <span class="info-value">${report.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">CLASS:</span>
              <span class="info-value">${report.class}</span>
            </div>
            <div class="info-row">
              <span class="info-label">GENDER:</span>
              <span class="info-value">${report.gender}</span>
            </div>
            <div class="info-row">
              <span class="info-label">TERM:</span>
              <span class="info-value">${report.term}</span>
            </div>
          </div>
          <div class="info-grid" style="margin-top:5px;">
            <div class="info-row">
              <span class="info-label">SESSION:</span>
              <span class="info-value">${report.session}</span>
            </div>
            <div class="info-row">
              <span class="info-label">NO IN CLASS:</span>
              <span class="info-value">${report.noInClass}</span>
            </div>
            <div class="info-row">
              <span class="info-label">DATE OF BIRTH:</span>
              <span class="info-value">${report.dateOfBirth}</span>
            </div>
            <div class="info-row">
              <span class="info-label"></span>
              <span class="info-value"></span>
            </div>
          </div>
          <div style="margin-top:8px;display:flex;gap:20px;">
            <span><strong>NO OF TIMES SCHOOL OPENED:</strong> ${report.timesSchoolOpened}</span>
            <span><strong>NO OF TIMES PRESENT:</strong> ${report.timesPresent}</span>
            <span><strong>NO OF TIMES ABSENT:</strong> ${report.timesAbsent}</span>
          </div>
          <div style="margin-top:5px;display:flex;gap:20px;">
            <span><strong>CLOSING DATE:</strong> ${report.closingDate}</span>
            <span><strong>RESUMPTION DATE:</strong> ${report.resumptionDate}</span>
          </div>
          <div style="margin-top:8px;display:flex;gap:30px;">
            <span><strong>OVERALL TOTAL:</strong> ${report.overallTotal}</span>
            <span><strong>AVERAGE:</strong> ${report.average}</span>
            <span><strong>PERCENTAGE:</strong> ${report.percentage}%</span>
            <span><strong>POSITION:</strong> ${report.position}</span>
          </div>
        </div>

        <div class="section-title">PUPIL'S ACADEMIC PERFORMANCE</div>
        
        <table>
          <thead>
            <tr>
              <th class="subject-col">SUBJECT</th>
              <th>1ST C.A<br/>20%</th>
              <th>2ND C.A<br/>20%</th>
              <th>EXAM<br/>60%</th>
              <th>TOTAL<br/>100%</th>
              <th>GRADE</th>
              <th>REMARKS</th>
            </tr>
          </thead>
          <tbody>
            ${report.subjects.map(s => `
              <tr>
                <td class="subject-col">${s.subject}</td>
                <td>${s.firstCA}</td>
                <td>${s.secondCA}</td>
                <td>${s.exam}</td>
                <td><strong>${s.total}</strong></td>
                <td class="grade-${s.grade}">${s.grade}</td>
                <td>${s.remarks}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="three-col">
          <div>
            <table class="domain-table">
              <thead>
                <tr><th colspan="2">DOMAINS / RATING</th></tr>
              </thead>
              <tbody>
                <tr><td>PUNCTUALITY</td><td>${report.affective.punctuality}</td></tr>
                <tr><td>ATTENDANCE</td><td>${report.affective.attendance}</td></tr>
                <tr><td>SELF-CONTROL</td><td>${report.affective.selfControl}</td></tr>
                <tr><td>NEATNESS</td><td>${report.affective.neatness}</td></tr>
                <tr><td>RESPONSIBILITY</td><td>${report.affective.responsibility}</td></tr>
                <tr><td>DILIGENCE</td><td>${report.affective.diligence}</td></tr>
                <tr><td>ATTENTIVENESS</td><td>${report.affective.attentiveness}</td></tr>
                <tr><td>LEADERSHIP</td><td>${report.affective.leadership}</td></tr>
                <tr><td>ACCURACY</td><td>${report.affective.accuracy}</td></tr>
                <tr><td>SPORTS & GAMES</td><td>${report.affective.sports}</td></tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <table class="keys-table">
              <thead>
                <tr><th colspan="2">KEYS TO GRADING</th></tr>
              </thead>
              <tbody>
                ${GRADING_KEYS.map(k => `<tr><td>${k.range}</td><td>${k.grade}=${k.remark}</td></tr>`).join('')}
              </tbody>
            </table>
            <table class="keys-table" style="margin-top:5px;">
              <thead>
                <tr><th colspan="2">KEYS TO RATING</th></tr>
              </thead>
              <tbody>
                ${RATING_KEYS.map(k => `<tr><td>${k.level}=</td><td>${k.desc}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          
          <div>
            <table class="bill-table">
              <thead>
                <tr><th colspan="2">SCHOOL BILL</th></tr>
              </thead>
              <tbody>
                <tr><td>TUITION FEE</td><td>₦ ${report.fees.tuition.toLocaleString()}</td></tr>
                <tr><td>EXAMINATION FEE</td><td>₦ ${report.fees.exam.toLocaleString()}</td></tr>
                <tr><td>SPORT WEAR FEE</td><td>₦ ${report.fees.sport.toLocaleString()}</td></tr>
                <tr><td>LESSON FEE</td><td>₦ ${report.fees.lesson.toLocaleString()}</td></tr>
                <tr><td></td><td>₦ ${report.fees.other.toLocaleString()}</td></tr>
                <tr><td><strong>OUTSTANDING BILL</strong></td><td><strong>₦ ${report.fees.outstanding.toLocaleString()}</strong></td></tr>
                <tr><td><strong>TOTAL</strong></td><td><strong>₦ ${report.fees.total.toLocaleString()}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="remarks-section">
          <div class="remark-line">
            <span class="remark-label">CLASS TEACHER'S REMARK:</span>
            <span class="remark-value">${report.classTeacherRemark}</span>
          </div>
          <div class="remark-line">
            <span class="remark-label">HEAD TEACHER'S REMARK:</span>
            <span class="remark-value">${report.headTeacherRemark}</span>
          </div>
        </div>

        <div class="signature-row">
          <div class="signature-box">
            <div class="signature-line">DATE</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">SIGNATURE</div>
          </div>
        </div>

        <div class="no-print" style="margin-top:30px;text-align:center;">
          <button onclick="window.print()" style="padding:10px 20px;background:#0066cc;color:white;border:none;cursor:pointer;font-size:14px;">
            Print Report Card
          </button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Report Cards</h1>
          <p className="text-zinc-500 mt-1 text-sm sm:text-base">Nigerian Primary School Terminal Reports</p>
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
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">88%</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap size={20} className="text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Total Students</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">45</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star size={20} className="text-purple-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Distinctions</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">12</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Promoted</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">38</p>
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
        <select className="px-4 py-2 border border-zinc-200 rounded-lg text-sm">
          <option>First Term</option>
          <option>Second Term</option>
          <option>Third Term</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockReports.map((report) => (
          <div 
            key={report.id} 
            className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedReport(report)}
          >
            <div className="p-4 sm:p-6 border-b border-zinc-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-lg">
                    {report.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">{report.name}</h3>
                    <p className="text-xs text-zinc-500">{report.class}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeInfo(report.average).grade === 'A' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {getGradeInfo(report.average).grade}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-zinc-500">Average</p>
                  <p className="font-bold text-zinc-900">{report.average}%</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Position</p>
                  <p className="font-bold text-zinc-900">#{report.position}/{report.noInClass}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Attendance</p>
                  <p className="font-bold text-zinc-900">{Math.round((report.timesPresent/report.timesSchoolOpened)*100)}%</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 bg-zinc-50">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">Term {report.term} • {report.session}</span>
                <button className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700">
                  <FileText size={14} />
                  View Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full my-8 max-h-[95vh] overflow-y-auto">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-zinc-900">Report Card Preview</h3>
              <button onClick={() => setSelectedReport(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            
            {/* Report Preview */}
            <div className="p-6">
              {/* Header */}
              <div className="border-b-2 border-black pb-4 mb-4 flex items-center gap-4">
                {schoolLogo ? (
                  <img src={schoolLogo} className="w-16 h-16 object-contain" alt="School Logo" />
                ) : (
                  <div className="w-16 h-16 bg-zinc-100 border border-zinc-300 flex items-center justify-center">
                    <span className="text-xs text-zinc-400">Logo</span>
                  </div>
                )}
                <div className="flex-1 text-center">
                  <h2 className="text-xl font-bold text-red-700">{schoolInfo.name}</h2>
                  <p className="text-xs text-zinc-600">{schoolInfo.address}</p>
                  <p className="text-xs text-zinc-600">{schoolInfo.email}, {schoolInfo.phone}</p>
                  <p className="text-sm font-bold text-red-700 mt-1">MOTTO: {schoolInfo.motto}</p>
                </div>
                <div className="w-16 h-20 bg-zinc-100 border border-zinc-300 flex items-center justify-center">
                  <Camera size={20} className="text-zinc-400" />
                </div>
              </div>

              <div className="border-2 border-black text-center py-2 mb-4">
                <h3 className="text-lg font-bold">FIRST TERM REPORT SHEET</h3>
              </div>

              {/* Student Info */}
              <div className="border border-black p-3 mb-4 text-sm">
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="flex gap-1"><span className="font-bold">NAME:</span> <span className="border-b border-black flex-1">{selectedReport.name}</span></div>
                  <div className="flex gap-1"><span className="font-bold">CLASS:</span> <span className="border-b border-black flex-1">{selectedReport.class}</span></div>
                  <div className="flex gap-1"><span className="font-bold">GENDER:</span> <span className="border-b border-black flex-1">{selectedReport.gender}</span></div>
                  <div className="flex gap-1"><span className="font-bold">TERM:</span> <span className="border-b border-black flex-1">{selectedReport.term}</span></div>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="flex gap-1"><span className="font-bold">SESSION:</span> <span className="border-b border-black flex-1">{selectedReport.session}</span></div>
                  <div className="flex gap-1"><span className="font-bold">NO IN CLASS:</span> <span className="border-b border-black flex-1">{selectedReport.noInClass}</span></div>
                  <div className="flex gap-1"><span className="font-bold">DATE OF BIRTH:</span> <span className="border-b border-black flex-1">{selectedReport.dateOfBirth}</span></div>
                </div>
                <div className="flex gap-4 text-xs mt-2">
                  <span><strong>NO OF TIMES SCHOOL OPENED:</strong> {selectedReport.timesSchoolOpened}</span>
                  <span><strong>NO OF TIMES PRESENT:</strong> {selectedReport.timesPresent}</span>
                  <span><strong>NO OF TIMES ABSENT:</strong> {selectedReport.timesAbsent}</span>
                </div>
                <div className="flex gap-4 text-xs mt-1">
                  <span><strong>CLOSING DATE:</strong> {selectedReport.closingDate}</span>
                  <span><strong>RESUMPTION DATE:</strong> {selectedReport.resumptionDate}</span>
                </div>
                <div className="flex gap-8 text-xs mt-2">
                  <span><strong>OVERALL TOTAL:</strong> {selectedReport.overallTotal}</span>
                  <span><strong>AVERAGE:</strong> {selectedReport.average}</span>
                  <span><strong>PERCENTAGE:</strong> {selectedReport.percentage}%</span>
                  <span><strong>POSITION:</strong> {selectedReport.position}</span>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="bg-red-700 text-white text-center py-1 text-sm font-bold mb-2">
                PUPIL'S ACADEMIC PERFORMANCE
              </div>
              <table className="w-full text-xs border border-black mb-4">
                <thead>
                  <tr className="bg-zinc-100">
                    <th className="border border-black p-1 text-left">SUBJECT</th>
                    <th className="border border-black p-1">1ST C.A 20%</th>
                    <th className="border border-black p-1">2ND C.A 20%</th>
                    <th className="border border-black p-1">EXAM 60%</th>
                    <th className="border border-black p-1">TOTAL 100%</th>
                    <th className="border border-black p-1">GRADE</th>
                    <th className="border border-black p-1">REMARKS</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReport.subjects.map((subject, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1">{subject.subject}</td>
                      <td className="border border-black p-1 text-center">{subject.firstCA}</td>
                      <td className="border border-black p-1 text-center">{subject.secondCA}</td>
                      <td className="border border-black p-1 text-center">{subject.exam}</td>
                      <td className="border border-black p-1 text-center font-bold">{subject.total}</td>
                      <td className={`border border-black p-1 text-center font-bold ${subject.grade === 'A' ? 'bg-green-200' : subject.grade === 'F' ? 'bg-red-200' : 'bg-yellow-100'}`}>{subject.grade}</td>
                      <td className="border border-black p-1">{subject.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Three Column Layout */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                {/* Domains */}
                <div>
                  <table className="w-full border border-black">
                    <thead>
                      <tr className="bg-zinc-100">
                        <th className="border border-black p-1">DOMAINS</th>
                        <th className="border border-black p-1">RATING</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedReport.affective).map(([key, value]) => (
                        <tr key={key}>
                          <td className="border border-black p-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                          <td className="border border-black p-1 text-center font-bold">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Keys */}
                <div>
                  <table className="w-full border border-black mb-2">
                    <thead>
                      <tr className="bg-zinc-100">
                        <th className="border border-black p-1" colSpan={2}>KEYS TO GRADING</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GRADING_KEYS.map((k, i) => (
                        <tr key={i}>
                          <td className="border border-black p-1">{k.range}</td>
                          <td className="border border-black p-1">{k.grade}={k.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <table className="w-full border border-black">
                    <thead>
                      <tr className="bg-zinc-100">
                        <th className="border border-black p-1" colSpan={2}>KEYS TO RATING</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RATING_KEYS.map((k, i) => (
                        <tr key={i}>
                          <td className="border border-black p-1">{k.level}=</td>
                          <td className="border border-black p-1">{k.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* School Bill */}
                <div>
                  <table className="w-full border border-black">
                    <thead>
                      <tr className="bg-zinc-100">
                        <th className="border border-black p-1" colSpan={2}>SCHOOL BILL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-black p-1">TUITION FEE</td><td className="border border-black p-1 text-right">₦ {selectedReport.fees.tuition.toLocaleString()}</td></tr>
                      <tr><td className="border border-black p-1">EXAMINATION FEE</td><td className="border border-black p-1 text-right">₦ {selectedReport.fees.exam.toLocaleString()}</td></tr>
                      <tr><td className="border border-black p-1">SPORT WEAR FEE</td><td className="border border-black p-1 text-right">₦ {selectedReport.fees.sport.toLocaleString()}</td></tr>
                      <tr><td className="border border-black p-1">LESSON FEE</td><td className="border border-black p-1 text-right">₦ {selectedReport.fees.lesson.toLocaleString()}</td></tr>
                      <tr><td className="border border-black p-1"></td><td className="border border-black p-1 text-right">₦ {selectedReport.fees.other.toLocaleString()}</td></tr>
                      <tr><td className="border border-black p-1 font-bold">OUTSTANDING BILL</td><td className="border border-black p-1 text-right font-bold">₦ {selectedReport.fees.outstanding.toLocaleString()}</td></tr>
                      <tr><td className="border border-black p-1 font-bold">TOTAL</td><td className="border border-black p-1 text-right font-bold">₦ {selectedReport.fees.total.toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-end gap-2">
                  <span className="font-bold whitespace-nowrap">CLASS TEACHER&apos;S REMARK:</span>
                  <span className="border-b border-black flex-1 pb-1">{selectedReport.classTeacherRemark}</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="font-bold whitespace-nowrap">HEAD TEACHER&apos;S REMARK:</span>
                  <span className="border-b border-black flex-1 pb-1">{selectedReport.headTeacherRemark}</span>
                </div>
              </div>

              {/* Signature */}
              <div className="mt-8 flex justify-between">
                <div className="text-center w-48">
                  <div className="border-t border-black pt-1 text-sm">DATE</div>
                </div>
                <div className="text-center w-48">
                  <div className="border-t border-black pt-1 text-sm">SIGNATURE</div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 flex gap-3">
              <button 
                onClick={() => generatePDF(selectedReport)}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print / Download PDF
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
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Student Name</label>
                <input type="text" className="w-full px-4 py-3 border border-zinc-200 rounded-xl" placeholder="Enter student name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Class</label>
                <select className="w-full px-4 py-3 border border-zinc-200 rounded-xl">
                  <option>Select Class</option>
                  {['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Subject</label>
                <select className="w-full px-4 py-3 border border-zinc-200 rounded-xl">
                  <option>Select Subject</option>
                  {PRIMARY_SUBJECTS.map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">1st C.A</label>
                  <input type="number" max="20" className="w-full px-4 py-3 border border-zinc-200 rounded-xl" placeholder="/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">2nd C.A</label>
                  <input type="number" max="20" className="w-full px-4 py-3 border border-zinc-200 rounded-xl" placeholder="/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Exam</label>
                  <input type="number" max="60" className="w-full px-4 py-3 border border-zinc-200 rounded-xl" placeholder="/60" />
                </div>
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
