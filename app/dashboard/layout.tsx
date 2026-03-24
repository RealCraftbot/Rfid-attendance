'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Logo from '@/components/Logo';
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
  UserPlus,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Bus,
  Wallet,
  GraduationCap,
  FileText
} from 'lucide-react';

const role: string = 'admin';
const userData = { name: 'Admin User' };
const organization = { name: 'Greenfield Academy' };

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, href, active, onClick }: SidebarItemProps) => (
  <Link 
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg' 
        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', show: role === 'admin' || role === 'teacher' },
    { icon: BookOpen, label: 'Classrooms', href: '/dashboard/classrooms', show: role === 'admin' || role === 'teacher' },
    { icon: Users, label: 'Students', href: '/dashboard/students', show: role === 'admin' || role === 'teacher' },
    { icon: UserPlus, label: 'Parents', href: '/dashboard/parents', show: role === 'admin' || role === 'teacher' },
    { icon: UserCog, label: 'Staff', href: '/dashboard/staff', show: role === 'admin' },
    { icon: Cpu, label: 'Devices', href: '/dashboard/devices', show: role === 'admin' },
    { icon: Bus, label: 'Bus Tracking', href: '/dashboard/bus', show: role === 'admin' },
    { icon: History, label: 'Attendance', href: '/dashboard/attendance', show: role === 'admin' || role === 'teacher' },
    { icon: Wallet, label: 'Fees', href: '/dashboard/fees', show: role === 'admin' || role === 'parent' },
    { icon: FileText, label: 'View Reports', href: '/dashboard/view-reports', show: role === 'parent' },
    { icon: GraduationCap, label: 'Grades', href: '/dashboard/grades', show: role === 'admin' || role === 'teacher' || role === 'parent' },
    { icon: Baby, label: 'My Children', href: '/dashboard/parent', show: role === 'parent' },
    { icon: MessageSquare, label: 'Notifications', href: '/dashboard/notifications', show: role === 'parent' },
  ].filter(item => item.show);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  // Check if a nav item is active (supports nested routes)
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 z-50 px-4 flex items-center justify-between">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
        <Logo textColor="text-zinc-900" subtextColor="text-zinc-400" />
        <button className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg relative">
          <Bell size={24} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-zinc-900 text-white z-50 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <Logo textColor="text-white" subtextColor="text-zinc-400" />
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-zinc-400 hover:text-white lg:hidden"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.href}
                icon={item.icon} 
                label={item.label} 
                href={item.href}
                active={isActive(item.href)}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-800 space-y-1">
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              href="/dashboard/settings"
              active={isActive('/dashboard/settings')}
              onClick={() => setSidebarOpen(false)}
            />
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-zinc-200 items-center justify-between px-6">
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
                <p className="text-sm font-semibold text-zinc-900">{userData?.name}</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                  {organization?.name}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                {userData?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
