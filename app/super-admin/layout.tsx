'use client';

import React, { useEffect } from 'react';
import { 
  BarChart3, 
  Building2, 
  Users, 
  Settings, 
  LogOut,
  Search,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const SidebarItem = ({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active: boolean }) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-brand-green text-brand-navy shadow-lg shadow-brand-green/20' 
        : 'text-brand-purple/60 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, role } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (role !== 'super-admin') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, role, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-zinc-900 rounded-full border-t-transparent animate-spin" />
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  if (role !== 'super-admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 bg-brand-navy flex flex-col text-white">
        <div className="p-6">
          <Link href="/super-admin" className="block mb-8">
            <Logo 
              textColor="text-white" 
              subtextColor="text-brand-purple/60" 
            />
          </Link>

          <nav className="space-y-1">
            <SidebarItem 
              icon={BarChart3} 
              label="Global Stats" 
              href="/super-admin" 
              active={pathname === '/super-admin'} 
            />
            <SidebarItem 
              icon={Building2} 
              label="Organizations" 
              href="/super-admin/organizations" 
              active={pathname === '/super-admin/organizations'} 
            />
            <SidebarItem 
              icon={Users} 
              label="User Management" 
              href="/super-admin/users" 
              active={pathname === '/super-admin/users'} 
            />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-1 border-t border-white/10">
          <SidebarItem 
            icon={Settings} 
            label="System Settings" 
            href="/super-admin/settings" 
            active={pathname === '/super-admin/settings'} 
          />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200"
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
              placeholder="Search organizations, admins..." 
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
                <p className="text-sm font-semibold text-zinc-900">Super Admin</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Platform Owner</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                SA
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
