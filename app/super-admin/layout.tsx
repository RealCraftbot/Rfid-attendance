'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BarChart3, Building2, Users, Settings, LogOut, Search, Bell } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { signOut } from 'next-auth/react';

const SidebarItem = ({ icon: Icon, label, href, active }: { icon: any; label: string; href: string; active: boolean }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active
        ? 'bg-green-500 text-zinc-900 shadow-lg shadow-green-500/20'
        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <div className="flex h-screen bg-zinc-100">
      <aside className="w-64 border-r border-zinc-200 bg-zinc-900 flex flex-col text-white">
        <div className="p-6">
          <Link href="/super-admin" className="block mb-8">
            <Logo textColor="text-white" subtextColor="text-zinc-400" />
          </Link>

          <nav className="space-y-1">
            <SidebarItem icon={BarChart3} label="Global Stats" href="/super-admin" active={pathname === '/super-admin'} />
            <SidebarItem icon={Building2} label="Organizations" href="/super-admin/organizations" active={pathname === '/super-admin/organizations'} />
            <SidebarItem icon={Users} label="User Management" href="/super-admin/users" active={pathname === '/super-admin/users'} />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-1 border-t border-zinc-800">
          <SidebarItem icon={Settings} label="System Settings" href="/super-admin/settings" active={pathname === '/super-admin/settings'} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-200 w-96">
            <Search size={18} className="text-zinc-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              className="bg-transparent border-none outline-none text-sm w-full text-zinc-900"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-zinc-500 hover:text-zinc-900">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="h-8 w-[1px] bg-zinc-200" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-900">Super Admin</p>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Platform Owner</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 font-bold">
                SA
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
