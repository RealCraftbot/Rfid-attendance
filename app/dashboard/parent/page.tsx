'use client';

import React, { useEffect, useState } from 'react';
import { 
  Baby, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Bell,
  ChevronRight,
  MapPin,
  ChevronLeft,
  AlertCircle,
  Plus,
  X,
  UserPlus,
  Search,
  Loader2
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import Image from 'next/image';

export default function ParentDashboard() {
  const { user, organization, role, loading: authLoading, userData } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Link Child Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);

  useEffect(() => {
    if (!user?.uid || !organization?.id) return;

    // Allow access for users with parent role OR if they're viewing from /dashboard route
    const studentsRef = collection(db, 'organizations', organization.id, 'students');
    const q = query(studentsRef, where('parent_id', '==', user.uid));
    
    const unsubChildren = onSnapshot(q, (snap) => {
      const kids = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChildren(kids);
      if (kids.length > 0 && !selectedChild) {
        setSelectedChild(kids[0]);
      }
      setLoading(false);
    });

    return () => unsubChildren();
  }, [user, organization]);

  useEffect(() => {
    if (!selectedChild || !organization?.id) return;

    const attendanceRef = collection(db, 'organizations', organization.id, 'attendance_records');
    const q = query(
      attendanceRef, 
      where('student_id', '==', selectedChild.id),
      orderBy('scan_time', 'desc'),
      limit(50)
    );

    const unsubAttendance = onSnapshot(q, (snap) => {
      setAttendanceHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubAttendance();
  }, [selectedChild, organization]);

  useEffect(() => {
    if (!user?.uid || !organization?.id) return;

    const notificationsRef = collection(db, 'organizations', organization.id, 'notifications');
    const q = query(
      notificationsRef,
      where('parent_id', '==', user.uid),
      orderBy('created_at', 'desc'),
      limit(10)
    );

    const unsubNotifications = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubNotifications();
  }, [user, organization]);

  const searchStudents = async () => {
    if (!searchQuery.trim() || !organization?.id) return;
    setSearching(true);
    setSearchResults([]);
    
    try {
      const studentsRef = collection(db, 'organizations', organization.id, 'students');
      const q = query(
        studentsRef,
        where('name', '>=', searchQuery.trim()),
        where('name', '<=', searchQuery.trim() + '\uf8ff'),
        limit(10)
      );
      
      const snap = await getDocs(q);
      const results = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(s => !s.parent_id); // Only show unlinked students
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    }
    
    setSearching(false);
  };

  const linkChild = async (student: any) => {
    if (!organization?.id || !user?.uid) return;
    setLinking(true);
    
    try {
      // Update student with parent_id
      await updateDoc(doc(db, 'organizations', organization.id, 'students', student.id), {
        parent_id: user.uid,
        linked_at: new Date(),
        linked_by: userData?.name || 'Parent'
      });
      
      // Create notification
      await addDoc(collection(db, 'organizations', organization.id, 'notifications'), {
        title: 'Child Linked',
        message: `${student.name} has been linked to your account.`,
        type: 'success',
        parent_id: user.uid,
        created_at: new Date()
      });
      
      setLinkSuccess(true);
      setTimeout(() => {
        setShowLinkModal(false);
        setLinkSuccess(false);
        setSearchQuery('');
        setSearchResults([]);
      }, 2000);
    } catch (err) {
      console.error('Link error:', err);
    }
    
    setLinking(false);
  };

  const getAttendanceForDay = (date: Date) => {
    return attendanceHistory.filter(record => 
      record.scan_time?.toDate && isSameDay(record.scan_time.toDate(), date)
    );
  };

  const calculateAttendanceRate = () => {
    if (attendanceHistory.length === 0) return 0;
    const uniqueDays = new Set(attendanceHistory
      .filter(r => r.check_type === 'check-in')
      .map(r => r.scan_time?.toDate?.toDateString())
    ).size;
    const daysSinceFirstRecord = Math.max(1, Math.ceil((new Date().getTime() - (attendanceHistory[attendanceHistory.length - 1]?.scan_time?.toDate()?.getTime() || Date.now())) / (1000 * 60 * 60 * 24)));
    return Math.round((uniqueDays / daysSinceFirstRecord) * 100);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-bold text-zinc-400 py-2">{day}</div>
        ))}
        {days.map((day, idx) => {
          const dayAttendance = getAttendanceForDay(day);
          const hasCheckIn = dayAttendance.some(a => a.check_type === 'check-in');
          const hasCheckOut = dayAttendance.some(a => a.check_type === 'check-out');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const isFuture = day > new Date();

          return (
            <div 
              key={idx} 
              className={`aspect-square p-1 rounded-lg text-center ${
                !isCurrentMonth ? 'bg-zinc-50' : isFuture ? 'bg-zinc-50/50' : 'bg-white'
              } ${isToday ? 'ring-2 ring-brand-blue' : ''} ${hasCheckIn ? 'border-l-4 border-emerald-500' : ''}`}
            >
              <span className={`text-xs ${!isCurrentMonth ? 'text-zinc-300' : isFuture ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {format(day, 'd')}
              </span>
              {hasCheckIn && isCurrentMonth && !isFuture && (
                <div className="mt-1 flex justify-center gap-0.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Checked In" />
                  {hasCheckOut && <div className="w-2 h-2 bg-blue-500 rounded-full" title="Checked Out" />}
                </div>
              )}
              {!hasCheckIn && isCurrentMonth && !isFuture && (
                <div className="mt-1 flex justify-center">
                  <div className="w-2 h-2 bg-red-300 rounded-full" title="Absent" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  // Allow access if role is parent OR if user has children linked (for users with role not set properly)
  if (role && role !== 'parent' && role !== 'admin' && role !== 'teacher') {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-zinc-500">This page is for parents only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Parent/Guardian Portal</h1>
          <p className="text-zinc-500 mt-1">Monitor your children&apos;s attendance and school activity.</p>
        </div>
        
        <button
          onClick={() => setShowLinkModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
        >
          <Plus size={18} />
          Link Child
        </button>
      </div>

      {children.length > 0 && (
        <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedChild?.id === child.id 
                  ? 'bg-white text-brand-blue shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      {selectedChild ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Child Status Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 rounded-full bg-brand-blue/10 border-4 border-white shadow-xl overflow-hidden relative mb-4">
                  <Image 
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(selectedChild.name)}`} 
                    alt={selectedChild.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">{selectedChild.name}</h2>
                <p className="text-zinc-500 text-sm font-medium">{selectedChild.class || 'Class Unassigned'}</p>
                
                <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Active Student
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Student ID</span>
                  <span className="font-mono font-bold text-zinc-900">{selectedChild.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">RFID</span>
                  <code className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded">{selectedChild.rfid_uid}</code>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Attendance Rate</span>
                  <span className="font-bold text-brand-blue">{calculateAttendanceRate()}%</span>
                </div>
                {selectedChild.dateOfBirth && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Date of Birth</span>
                    <span className="font-bold text-zinc-900">{selectedChild.dateOfBirth}</span>
                  </div>
                )}
                {selectedChild.bloodGroup && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Blood Group</span>
                    <span className="font-bold text-red-600">{selectedChild.bloodGroup}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-brand-navy p-6 rounded-3xl text-white shadow-xl shadow-brand-navy/20">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors flex flex-col items-center gap-2">
                  <Calendar size={20} className="text-brand-blue" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Request Leave</span>
                </button>
                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors flex flex-col items-center gap-2">
                  <Bell size={20} className="text-brand-purple" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Contact School</span>
                </button>
              </div>
            </div>
          </div>

          {/* Attendance View */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Toggle */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-1 inline-flex">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'list' ? 'bg-brand-blue text-white' : 'text-zinc-500'}`}
              >
                List View
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'calendar' ? 'bg-brand-blue text-white' : 'text-zinc-500'}`}
              >
                Calendar View
              </button>
            </div>

            {view === 'calendar' ? (
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-900">Attendance Calendar</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      className="p-2 hover:bg-zinc-100 rounded-lg"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="font-bold text-zinc-900 min-w-[120px] text-center">
                      {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button 
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      className="p-2 hover:bg-zinc-100 rounded-lg"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {renderCalendar()}
                  <div className="mt-6 flex items-center justify-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-zinc-500">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                      <span className="text-zinc-500">Absent</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-zinc-900">Recent Attendance</h3>
                </div>
                
                <div className="divide-y divide-zinc-50">
                  {attendanceHistory.length > 0 ? attendanceHistory.map((record) => (
                    <div key={record.id} className="p-6 hover:bg-zinc-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${
                          record.check_type === 'check-in' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-blue/5 text-brand-blue'
                        }`}>
                          {record.check_type === 'check-in' ? <CheckCircle2 size={20} /> : <MapPin size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">
                            {record.check_type === 'check-in' ? 'School Entry' : 'School Exit'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                            <MapPin size={12} />
                            <span>{record.device_id || 'Main Gate'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-zinc-900">
                          {record.scan_time?.toDate ? format(record.scan_time.toDate(), 'HH:mm a') : 'Just now'}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {record.scan_time?.toDate ? format(record.scan_time.toDate(), 'MMM d, yyyy') : ''}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-4">
                      <Clock size={48} strokeWidth={1} />
                      <p className="text-sm">No attendance records found for this child.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications Feed */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900 mb-6">Recent Notifications</h3>
              <div className="space-y-4">
                {notifications.length > 0 ? notifications.map((notif) => (
                  <div key={notif.id} className="flex gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${
                      notif.type === 'alert' ? 'bg-red-500' : 'bg-brand-blue'
                    }`}>
                      {notif.type === 'alert' ? <XCircle size={20} /> : <Bell size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{notif.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">{notif.message}</p>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2 block">
                        {notif.created_at?.toDate ? format(notif.created_at.toDate(), 'MMM d, HH:mm') : 'Just now'}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 flex flex-col items-center justify-center text-zinc-400 space-y-2">
                    <Bell size={32} strokeWidth={1} />
                    <p className="text-sm">No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-40 flex flex-col items-center justify-center text-zinc-400 space-y-4 bg-white rounded-3xl border border-dashed border-zinc-200">
          <Baby size={64} strokeWidth={1} />
          <div className="text-center">
            <p className="text-lg font-bold text-zinc-900">No children linked to your account</p>
            <p className="text-sm">Search for your child's name to link them to your account.</p>
            <button
              onClick={() => setShowLinkModal(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-brand-blue/90 transition-all mx-auto"
            >
              <Plus size={18} />
              Link Child
            </button>
          </div>
        </div>
      )}

      {/* Link Child Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Link Your Child</h2>
              <button 
                onClick={() => setShowLinkModal(false)}
                className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-zinc-500" />
              </button>
            </div>

            {linkSuccess ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-lg font-bold text-zinc-900">Child Linked Successfully!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Search by Student Name</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchStudents()}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 transition-all text-sm"
                        placeholder="Enter your child's name"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={searchStudents}
                    disabled={searching || !searchQuery.trim()}
                    className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-brand-blue/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    Search
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Select your child:</p>
                    {searchResults.map((student) => (
                      <div 
                        key={student.id}
                        className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                            <Baby size={20} className="text-brand-blue" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900">{student.name}</p>
                            <p className="text-xs text-zinc-500">{student.class || 'Class not assigned'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => linkChild(student)}
                          disabled={linking}
                          className="px-4 py-2 bg-brand-blue text-white rounded-xl font-bold text-xs hover:bg-brand-blue/90 transition-all disabled:opacity-50"
                        >
                          {linking ? <Loader2 size={14} className="animate-spin" /> : 'Link'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 && searchQuery && !searching && (
                  <div className="mt-6 py-8 text-center text-zinc-400">
                    <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No unlinked students found with that name.</p>
                    <p className="text-xs mt-1">Please check the spelling or contact the school.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
