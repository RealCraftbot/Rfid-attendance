'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Cpu, 
  History, 
  Settings, 
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const SidebarItem = ({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active: boolean }) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' 
        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, organization } = useAuth();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col">
        <div className="p-6 border-bottom border-zinc-100">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin-slow" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">RFID<span className="text-zinc-400">SaaS</span></span>
          </div>

          <nav className="space-y-1">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Overview" 
              href="/dashboard" 
              active={pathname === '/dashboard'} 
            />
            <SidebarItem 
              icon={Users} 
              label="Students" 
              href="/dashboard/students" 
              active={pathname === '/dashboard/students'} 
            />
            <SidebarItem 
              icon={Cpu} 
              label="Devices" 
              href="/dashboard/devices" 
              active={pathname === '/dashboard/devices'} 
            />
            <SidebarItem 
              icon={History} 
              label="Attendance" 
              href="/dashboard/attendance" 
              active={pathname === '/dashboard/attendance'} 
            />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-1 border-t border-zinc-100">
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            href="/dashboard/settings" 
            active={pathname === '/dashboard/settings'} 
          />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-200 w-96">
            <Search size={18} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search students, records..." 
              className="bg-transparent border-none outline-none text-sm w-full text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-zinc-500 hover:text-zinc-900 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            
            <div className="h-8 w-[1px] bg-zinc-200" />

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-900">{user?.displayName || 'Admin User'}</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{organization?.name || 'Loading...'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
                <img 
                  src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
