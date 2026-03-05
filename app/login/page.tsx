'use client';

import React, { useState } from 'react';
import { 
  LogIn, 
  Mail, 
  Lock, 
  ArrowRight,
  ShieldAlert,
  Cpu,
  Users,
  ShieldCheck
} from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized. Please check your configuration.');
      }
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-brand-navy p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-blue via-transparent to-transparent" />
          <div className="grid grid-cols-10 gap-4 p-4">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="w-1 h-1 bg-brand-purple rounded-full" />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="block mb-12">
            <Logo 
              textColor="text-white" 
              subtextColor="text-brand-purple/60" 
            />
          </Link>

          <h1 className="text-6xl font-bold text-white tracking-tighter leading-none mb-6">
            Secure <br />
            Attendance <br />
            <span className="text-brand-green italic">Simplified.</span>
          </h1>
          <p className="text-brand-purple/60 text-lg max-w-md leading-relaxed">
            Enterprise-grade RFID attendance management for schools and organizations. Real-time tracking, secure device authentication, and instant analytics.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="p-2 bg-white/5 w-fit rounded-lg text-brand-green">
              <ShieldCheck size={20} />
            </div>
            <p className="text-white font-bold text-sm">HMAC Secure</p>
            <p className="text-brand-purple/40 text-xs">Device-level signing</p>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-white/5 w-fit rounded-lg text-brand-blue">
              <Cpu size={20} />
            </div>
            <p className="text-white font-bold text-sm">Edge Ready</p>
            <p className="text-brand-purple/40 text-xs">ESP32 & Arduino support</p>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-white/5 w-fit rounded-lg text-brand-purple">
              <Users size={20} />
            </div>
            <p className="text-white font-bold text-sm">Multi-tenant</p>
            <p className="text-brand-purple/40 text-xs">Scalable architecture</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Sign In</h2>
            <p className="text-zinc-500 mt-2">Enter your credentials to access your dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3">
              <ShieldAlert size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 transition-all text-sm"
                    placeholder="admin@organization.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                <span className="text-sm text-zinc-500 group-hover:text-zinc-900 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-sm font-bold text-zinc-900 hover:underline">Forgot password?</button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Don&apos;t have an account? <Link href="/signup" className="font-bold text-zinc-900 hover:underline">Create Account</Link>
          </p>
          <p className="text-center text-sm text-zinc-400">
            Are you a parent? <Link href="/parent-signup" className="font-bold text-brand-blue hover:underline">Register Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
