'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Users, 
  ChevronRight, 
  Search,
  Calendar,
  GraduationCap,
  Baby,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useRBAC } from '@/hooks/use-rbac';
import { useSession } from 'next-auth/react';

// Types
interface Classroom {
  id: string;
  name: string;
  grade?: string;
  section?: string;
  teacherName?: string;
  studentCount: number;
}

// Mock classrooms data
const mockClassrooms: Classroom[] = [
  { id: '1', name: 'Primary 1', grade: 'Primary', section: 'A', teacherName: 'Mrs. Sarah Johnson', studentCount: 28 },
  { id: '2', name: 'Primary 2', grade: 'Primary', section: 'A', teacherName: 'Mr. Michael Brown', studentCount: 32 },
  { id: '3', name: 'Primary 3', grade: 'Primary', section: 'B', teacherName: 'Mrs. Emily Davis', studentCount: 30 },
  { id: '4', name: 'Primary 4', grade: 'Primary', section: 'A', teacherName: 'Mr. James Wilson', studentCount: 25 },
  { id: '5', name: 'Primary 5', grade: 'Primary', section: 'A', teacherName: 'Mrs. Patricia Moore', studentCount: 35 },
  { id: '6', name: 'Primary 6', grade: 'Primary', section: 'B', teacherName: 'Mr. Robert Taylor', studentCount: 29 },
  { id: '7', name: 'JSS 1', grade: 'Junior Secondary', section: 'Science', teacherName: 'Mrs. Linda Anderson', studentCount: 22 },
  { id: '8', name: 'JSS 2', grade: 'Junior Secondary', section: 'Science', teacherName: 'Mr. David Thomas', studentCount: 24 },
  { id: '9', name: 'JSS 3', grade: 'Junior Secondary', section: 'Art', teacherName: 'Mrs. Susan Jackson', studentCount: 26 },
  { id: '10', name: 'SS 1', grade: 'Senior Secondary', section: 'Science', teacherName: 'Mr. Charles White', studentCount: 20 },
  { id: '11', name: 'SS 2', grade: 'Senior Secondary', section: 'Commercial', teacherName: 'Mrs. Margaret Harris', studentCount: 23 },
  { id: '12', name: 'SS 3', grade: 'Senior Secondary', section: 'Art', teacherName: 'Mr. Christopher Martin', studentCount: 21 },
];

// Group classrooms by grade
const groupByGrade = (classrooms: Classroom[]) => {
  const grouped = new Map<string, Classroom[]>();
  classrooms.forEach((classroom) => {
    const grade = classroom.grade || 'Other';
    if (!grouped.has(grade)) {
      grouped.set(grade, []);
    }
    grouped.get(grade)?.push(classroom);
  });
  return grouped;
};

// Mock parent's children - in production, fetch from API
const mockParentChildren = [
  { id: 's1', name: 'Chukwuemeka Okafor', classId: '5', className: 'Primary 5', grade: 'Primary' },
];

// Mock teacher assignments - in production, fetch from API
const mockTeacherAssignments = ['1', '2', '3']; // Classroom IDs

export default function AttendanceClassesClient() {
  const router = useRouter();
  const { role, isParent, isTeacher, isAdmin } = useRBAC();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filter classrooms based on role and search
  const getFilteredClassrooms = () => {
    let accessibleClassrooms = mockClassrooms;

    // If parent, only show their children's classrooms
    if (isParent) {
      const childClassIds = mockParentChildren.map(child => child.classId);
      accessibleClassrooms = mockClassrooms.filter(c => childClassIds.includes(c.id));
    }
    // If teacher, only show their assigned classrooms
    else if (isTeacher) {
      accessibleClassrooms = mockClassrooms.filter(c => mockTeacherAssignments.includes(c.id));
    }
    // Admin sees all classrooms

    // Apply search filter
    return accessibleClassrooms.filter(
      (classroom) =>
        classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classroom.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classroom.grade?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredClassrooms = getFilteredClassrooms();
  const groupedClassrooms = groupByGrade(filteredClassrooms);

  const handleClassSelect = (classroomId: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    router.push(`/dashboard/attendance/${classroomId}?date=${dateStr}`);
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">Attendance History</h1>
          <p className="text-zinc-500 mt-1 text-xs sm:text-sm">Select a class to view attendance records</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-3 py-2">
          <Calendar size={16} className="text-zinc-400" />
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="text-sm border-none outline-none"
          />
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by class name, teacher, or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">
              {isParent ? 'Your Classes' : 'Total Classes'}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-900">{filteredClassrooms.length}</p>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-green-600" />
            <span className="text-xs text-green-600 font-medium">
              {isParent ? 'Your Children' : 'Total Students'}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-900">
            {isParent ? mockParentChildren.length : mockClassrooms.reduce((sum, c) => sum + c.studentCount, 0)}
          </p>
        </div>
        {!isParent && (
          <>
            <div className="bg-purple-50 p-3 sm:p-4 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap size={16} className="text-purple-600" />
                <span className="text-xs text-purple-600 font-medium">Primary</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-purple-900">
                {filteredClassrooms.filter(c => c.grade === 'Primary').length}
              </p>
            </div>
            <div className="bg-amber-50 p-3 sm:p-4 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap size={16} className="text-amber-600" />
                <span className="text-xs text-amber-600 font-medium">Secondary</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-amber-900">
                {filteredClassrooms.filter(c => c.grade?.includes('Secondary')).length}
              </p>
            </div>
          </>
        )}
        {isParent && (
          <div className="col-span-2 bg-amber-50 p-3 sm:p-4 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 mb-1">
              <Baby size={16} className="text-amber-600" />
              <span className="text-xs text-amber-600 font-medium">Viewing attendance for</span>
            </div>
            <p className="text-sm font-bold text-amber-900">
              {mockParentChildren.map(c => c.name).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Classes by Grade */}
      <div className="space-y-4 sm:space-y-6">
        {Array.from(groupedClassrooms.entries()).map(([grade, classrooms]) => (
          <div key={grade}>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-2 sm:mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600"></div>
              {grade}
              <span className="text-xs text-zinc-500 font-normal">({classrooms.length} classes)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {classrooms.map((classroom) => (
                <button
                  key={classroom.id}
                  onClick={() => handleClassSelect(classroom.id)}
                  className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-zinc-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                        {classroom.name}
                      </h3>
                      {classroom.section && (
                        <p className="text-xs text-zinc-500">Section {classroom.section}</p>
                      )}
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-zinc-600 flex items-center gap-1.5">
                      <Users size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span>{classroom.studentCount} students</span>
                    </p>
                    {classroom.teacherName && (
                      <p className="text-xs sm:text-sm text-zinc-600 flex items-center gap-1.5">
                        <BookOpen size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span>{classroom.teacherName}</span>
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredClassrooms.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-zinc-200">
          <BookOpen size={40} className="mx-auto mb-3 text-zinc-300" />
          <p className="text-zinc-500 text-sm">No classes found</p>
        </div>
      )}
    </div>
  );
}
