'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Cpu, 
  History, 
  Settings, 
  Bell,
  Search,
  ShieldCheck,
  BookOpen,
  Baby,
  MessageSquare,
  UserCog,
  UserPlus
} from 'lucide-react';

const role: string = 'admin';
const user = { displayName: 'Admin User', email: 'admin@school.com', photoURL: null };
const userData = { name: 'Admin User' };
const organization = { name: 'Greenfield Academy', id: 'org_123' };

const SidebarItem = ({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active: boolean }) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
        : 'text-brand-purple/60 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <aside className="w-64 border-r border-zinc-200 bg-brand-navy flex flex-col text-white">
        <div className="p-6">
          <Link href="/dashboard" className="block mb-8">
            <Logo 
              textColor="text-white" 
              subtextColor="text-brand-purple/60" 
            />
          </Link>

          <nav className="space-y-1">
            {(role === 'admin' || role === 'teacher') && (
              <>
                <SidebarItem 
                  icon={LayoutDashboard} 
                  label="Overview" 
                  href="/dashboard" 
                  active={pathname === '/dashboard'} 
                />
                <SidebarItem 
                  icon={BookOpen} 
                  label="Classrooms" 
                  href="/dashboard/classrooms" 
                  active={pathname === '/dashboard/classrooms'} 
                />
                <SidebarItem 
                  icon={Users} 
                  label="Students" 
                  href="/dashboard/students" 
                  active={pathname === '/dashboard/students'} 
                />
                <SidebarItem 
                  icon={UserPlus} 
                  label="Parents" 
                  href="/dashboard/parents" 
                  active={pathname === '/dashboard/parents'} 
                />
                {role === 'admin' && (
                  <SidebarItem 
                    icon={UserCog} 
                    label="Staff" 
                    href="/dashboard/staff" 
                    active={pathname === '/dashboard/staff'} 
                  />
                )}
              </>
            )}

            {role === 'admin' && (
              <SidebarItem 
                icon={Cpu} 
                label="Devices" 
                href="/dashboard/devices" 
                active={pathname === '/dashboard/devices'} 
              />
            )}

            {role === 'parent' && (
              <>
                <SidebarItem 
                  icon={LayoutDashboard} 
                  label="My Children" 
                  href="/dashboard" 
                  active={pathname === '/dashboard'} 
                />
                <SidebarItem 
                  icon={MessageSquare} 
                  label="Notifications" 
                  href="/dashboard/notifications" 
                  active={pathname === '/dashboard/notifications'} 
                />
              </>
            )}

            {(role === 'admin' || role === 'teacher') && (
              <SidebarItem 
                icon={History} 
                label="Attendance" 
                href="/dashboard/attendance" 
                active={pathname === '/dashboard/attendance'} 
              />
            )}

            {role === 'super-admin' && (
              <SidebarItem 
                icon={ShieldCheck} 
                label="Super Admin" 
                href="/super-admin" 
                active={false} 
              />
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-1 border-t border-white/10">
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            href="/dashboard/settings" 
            active={pathname === '/dashboard/settings'} 
          />
          <Link 
            href="/login"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            Logout
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
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
                <p className="text-sm font-semibold text-zinc-900">{userData?.name || user?.displayName || user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                  {role === 'parent' ? 'Parent/Guardian' : role === 'teacher' ? 'Teacher' : role === 'admin' ? organization?.name || 'Admin' : organization?.name || 'Loading...'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-blue/10 border border-brand-blue/20 overflow-hidden relative flex items-center justify-center">
                <div className="flex items-center justify-center bg-brand-blue/10 text-brand-blue font-bold text-xs">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
