'use client';

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
  ChevronDown,
  Bus,
  Wallet,
  GraduationCap,
  FileText,
  UserCheck,
  Loader2
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

// Navigation items configuration with role-based access
const getNavItems = (role: string) => {
  // Admin navigation
  const adminItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: BookOpen, label: 'Classrooms', href: '/dashboard/classrooms' },
    { icon: Users, label: 'Students', href: '/dashboard/students' },
    { icon: UserPlus, label: 'Parents', href: '/dashboard/parents' },
    { icon: UserCog, label: 'Staff', href: '/dashboard/staff' },
    { icon: Cpu, label: 'Devices', href: '/dashboard/devices' },
    { icon: Bus, label: 'Bus Tracking', href: '/dashboard/bus' },
    { icon: History, label: 'Attendance', href: '/dashboard/attendance' },
    { icon: UserCheck, label: 'Teacher Attendance', href: '/dashboard/teacher-attendance' },
    { icon: Wallet, label: 'Fees & Payments', href: '/dashboard/admin/fees' },
    { icon: GraduationCap, label: 'Grades', href: '/dashboard/grades' },
  ];

  // Teacher navigation
  const teacherItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: BookOpen, label: 'My Classes', href: '/dashboard/classrooms' },
    { icon: Users, label: 'Students', href: '/dashboard/students' },
    { icon: History, label: 'Attendance', href: '/dashboard/attendance' },
    { icon: GraduationCap, label: 'Grades', href: '/dashboard/grades' },
  ];

  // Bursar navigation
  const bursarItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Users, label: 'Students', href: '/dashboard/students' },
    { icon: Wallet, label: 'Fees & Payments', href: '/dashboard/bursar' },
  ];

  // Parent navigation
  const parentItems = [
    { icon: Baby, label: 'My Children', href: '/dashboard/parent' },
    { icon: History, label: 'Attendance', href: '/dashboard/attendance' },
    { icon: Wallet, label: 'Pay School Fees', href: '/dashboard/fees' },
    { icon: FileText, label: 'View Reports', href: '/dashboard/view-reports' },
    { icon: GraduationCap, label: 'Grades', href: '/dashboard/grades' },
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
  const [isLoading, setIsLoading] = useState(true);

  // Get user role and data from session
  const userRole = session?.user?.role || '';
  const userData = session?.user;
  const organization = userData?.organization;

  // Navigation items based on role
  const navItems = getNavItems(userRole);

  useEffect(() => {
    // Handle loading state
    if (status === 'loading') {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }

    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    // Redirect to correct dashboard based on role
    if (status === 'authenticated' && pathname === '/dashboard') {
      // User is already on dashboard, no need to redirect
      // But we should verify they have access to the current page
      const hasAccess = navItems.some(item => pathname.startsWith(item.href) || item.href === '/dashboard');
      if (!hasAccess && navItems.length > 0) {
        // Redirect to first allowed page
        router.push(navItems[0].href);
      }
    }
  }, [status, pathname, router, navItems]);

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

  // Show loading state
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-blue-600" />
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if no valid role
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

          {/* User Info */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                {userData?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{userData?.name}</p>
                <p className="text-xs text-zinc-400 capitalize">{userRole?.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
            {organization && (
              <p className="text-xs text-zinc-500 mt-2 truncate">{organization.name}</p>
            )}
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
                  {userRole?.replace('_', ' ')}
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
