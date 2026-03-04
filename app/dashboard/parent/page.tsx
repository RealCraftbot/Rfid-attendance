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
  MapPin
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';
import Image from 'next/image';

export default function ParentDashboard() {
  const { user, organization } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !organization?.id) return;

    // 1. Fetch children linked to this parent
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
  }, [user, organization, selectedChild]);

  useEffect(() => {
    if (!selectedChild || !organization?.id) return;

    // 2. Fetch attendance history for selected child
    const attendanceRef = collection(db, 'organizations', organization.id, 'attendance_records');
    const q = query(
      attendanceRef, 
      where('student_id', '==', selectedChild.id),
      orderBy('scan_time', 'desc'),
      limit(20)
    );

    const unsubAttendance = onSnapshot(q, (snap) => {
      setAttendanceHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubAttendance();
  }, [selectedChild, organization]);

  useEffect(() => {
    if (!user?.uid || !organization?.id) return;

    // 3. Fetch notifications for this parent
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
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Parent Portal</h1>
          <p className="text-zinc-500 mt-1">Monitor your children&apos;s attendance and school activity.</p>
        </div>
        
        {/* Children Selector */}
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
      </div>

      {selectedChild ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Child Status Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 rounded-full bg-brand-blue/10 border-4 border-white shadow-xl overflow-hidden relative mb-4">
                  <Image 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChild.name}`} 
                    alt={selectedChild.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">{selectedChild.name}</h2>
                <p className="text-zinc-500 text-sm font-medium">{selectedChild.class_name || 'Class Unassigned'}</p>
                
                <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Currently in School
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Student ID</span>
                  <span className="font-mono font-bold text-zinc-900">{selectedChild.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Attendance Rate</span>
                  <span className="font-bold text-brand-blue">98%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Last Scan</span>
                  <span className="font-bold text-zinc-900">08:15 AM</span>
                </div>
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
                  <span className="text-[10px] font-bold uppercase tracking-widest">Alert School</span>
                </button>
              </div>
            </div>
          </div>

          {/* Attendance History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-zinc-900">Recent Attendance</h3>
                <button className="text-sm font-bold text-brand-blue hover:underline">View Full Report</button>
              </div>
              
              <div className="divide-y divide-zinc-50">
                {attendanceHistory.length > 0 ? attendanceHistory.map((record) => (
                  <div key={record.id} className="p-6 hover:bg-zinc-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${
                        record.check_type === 'check-in' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-blue/5 text-brand-blue'
                      }`}>
                        <Clock size={20} />
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
            <p className="text-sm">Please contact the school administration to link your children to your parent account.</p>
          </div>
        </div>
      )}
    </div>
  );
}
