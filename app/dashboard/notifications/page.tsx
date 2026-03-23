'use client';

import React, { useState } from 'react';
import { 
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

const mockNotifications = [
  { id: 'n1', title: 'Check-in Alert', message: 'Adebayo Oluwaseun checked in at Main Entrance', type: 'success', created_at: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 'n2', title: 'Check-out Alert', message: 'Chukwu Adaobi checked out at Back Gate', type: 'success', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: 'n3', title: 'Late Arrival', message: 'Okonkwo Chibueze arrived late at 8:45 AM', type: 'alert', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: 'n4', title: 'System Update', message: 'RFID reader firmware updated successfully', type: 'info', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: 'n5', title: 'Weekly Report', message: 'Weekly attendance report is now available', type: 'info', created_at: new Date(Date.now() - 1000 * 60 * 60 * 48) },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

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
                    {format(notif.created_at, 'MMM d, HH:mm')}
                  </span>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    <Clock size={12} />
                    <span>{format(notif.created_at, 'p')}</span>
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
