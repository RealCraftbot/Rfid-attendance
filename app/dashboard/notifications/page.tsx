'use client';

import React, { useEffect, useState } from 'react';
import { 
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  Trash2
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const { user, organization, role } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !organization?.id) return;

    const notificationsRef = collection(db, 'organizations', organization.id, 'notifications');
    
    // If parent, only show their notifications
    // If admin, show all? Or maybe just parent notifications for now
    let q;
    if (role === 'parent') {
      q = query(
        notificationsRef,
        where('parent_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
    } else {
      q = query(
        notificationsRef,
        orderBy('created_at', 'desc'),
        limit(50)
      );
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, organization, role]);

  const deleteNotification = async (id: string) => {
    if (!organization?.id) return;
    await deleteDoc(doc(db, 'organizations', organization.id, 'notifications', id));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Notifications</h1>
          <p className="text-zinc-500 mt-1">Stay updated with school alerts and child activity.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-zinc-100">
          {notifications.length > 0 ? notifications.map((notif) => (
            <div key={notif.id} className="p-6 hover:bg-zinc-50 transition-colors group flex gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                notif.type === 'alert' ? 'bg-red-50 text-red-600' : 
                notif.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                'bg-brand-blue/5 text-brand-blue'
              }`}>
                {notif.type === 'alert' ? <XCircle size={24} /> : 
                 notif.type === 'success' ? <CheckCircle2 size={24} /> : 
                 <Bell size={24} />}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-zinc-900">{notif.title}</h3>
                    <p className="text-sm text-zinc-600 mt-1">{notif.message}</p>
                  </div>
                  <span className="text-xs font-medium text-zinc-400 whitespace-nowrap">
                    {notif.created_at?.toDate ? format(notif.created_at.toDate(), 'MMM d, HH:mm') : 'Just now'}
                  </span>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    <Clock size={12} />
                    <span>{notif.created_at?.toDate ? format(notif.created_at.toDate(), 'p') : ''}</span>
                  </div>
                  
                  <button 
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-32 flex flex-col items-center justify-center text-zinc-400 space-y-4">
              <div className="p-6 bg-zinc-50 rounded-full">
                <Bell size={64} strokeWidth={1} />
              </div>
              <div className="text-center">
                <p className="font-bold text-zinc-900 text-lg">No notifications yet</p>
                <p className="text-sm">We&apos;ll notify you when there&apos;s important activity.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
