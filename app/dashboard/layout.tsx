'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
  Bus,
  Wallet,
  GraduationCap,
  FileText,
  UserCheck,
  Loader2,
  Calendar,
  ClipboardList
} from 'lucide-react';

// Role type matching the database
type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'BURSAR';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, href, active, onClick }: SidebarItemProps) => (
  <button 
    onClick={() => {
      if (onClick) onClick();
      window.location.href = href;
    }}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg' 
        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

// Navigation items configuration with role-based access
const getNavItems = (role: string) => {
  const adminItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: UserCog, label: 'Staff', href: '/dashboard/staff' },
    { icon: BookOpen, label: 'Classrooms', href: '/dashboard/classrooms' },
    { icon: Users, label: 'Students', href: '/dashboard/students' },
    { icon: UserPlus, label: 'Parents', href: '/dashboard/parents' },
    { icon: ClipboardList, label: 'Enrollments', href: '/dashboard/admin/enrollments' },
    { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
    { icon: Cpu, label: 'Devices', href: '/dashboard/devices' },
    { icon: Bus, label: 'Bus Tracking', href: '/dashboard/bus' },
    { icon: Calendar, label: 'Timetable', href: '/dashboard/timetable' },
    { icon: UserCheck, label: 'Teacher Schedule', href: '/dashboard/teacher-schedule' },
    { icon: History, label: 'Attendance', href: '/dashboard/attendance' },
    { icon: Wallet, label: 'Fees & Payments', href: '/dashboard/admin/fees' },
    { icon: GraduationCap, label: 'Grades', href: '/dashboard/grades' },
  ];

  const teacherItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Calendar, label: 'My Schedule', href: '/dashboard/teacher-schedule' },
    { icon: BookOpen, label: 'My Classes', href: '/dashboard/classrooms' },
    { icon: Users, label: 'Students', href: '/dashboard/students' },
    { icon: History, label: 'Attendance', href: '/dashboard/attendance' },
    { icon: GraduationCap, label: 'Grades', href: '/dashboard/grades' },
  ];

  const bursarItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Users, label: 'Students', href: '/dashboard/students' },
    { icon: Wallet, label: 'Fees & Payments', href: '/dashboard/bursar' },
  ];

  const parentItems = [
    { icon: Baby, label: 'My Children', href: '/dashboard/parent' },
    { icon: History, label: 'Attendance', href: '/dashboard/attendance' },
    { icon: Wallet, label: 'Pay School Fees', href: '/dashboard/fees' },
    { icon: FileText, label: 'View Reports', href: '/dashboard/view-reports' },
    { icon: MessageSquare, label: 'Notifications', href: '/dashboard/notifications' },
  ];

  switch (role) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return adminItems;
    case 'TEACHER':
      return teacherItems;
    case 'BURSAR':
      return bursarItems;
    case 'PARENT':
      return parentItems;
    default:
      return [];
  }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to defer setState
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  // Handle authentication
  useEffect(() => {
    if (!mounted) return;
    
    if (status === 'unauthenticated') {
      console.log('Not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [status, router, mounted]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Don't render anything until mounted (prevent hydration mismatch)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-blue-600" />
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-blue-600" />
          <p className="text-zinc-600">Checking session...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (will redirect)
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-blue-600" />
          <p className="text-zinc-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Get user data
  const userRole = session?.user?.role || '';
  const userData = session?.user;
  const organization = userData?.organization;
  const navItems = getNavItems(userRole);

  // If authenticated but no valid role
  if (!userRole || navItems.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck size={64} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h1>
          <p className="text-zinc-600 mb-4">You do not have permission to access this area.</p>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center overflow-hidden text-sm">
            {userData?.imageUrl ? (
              <img src={userData.imageUrl} alt={userData?.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              <span>{userData?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
        </div>
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

            <Link href="/dashboard/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-900">{userData?.name}</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                  {userRole?.replace('_', ' ')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center overflow-hidden">
                {userData?.imageUrl ? (
                  <img 
                    src={userData.imageUrl} 
                    alt={userData?.name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{userData?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
            </Link>
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
