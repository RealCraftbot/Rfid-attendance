'use client';

import React, { useState } from 'react';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  Building,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!auth || !db) {
        throw new Error('Firebase is not initialized. Please check your configuration.');
      }

      // 1. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create Organization Document
      await setDoc(doc(db, 'organizations', user.uid), {
        name: orgName,
        admin_email: email,
        created_at: new Date(),
        plan: 'free',
        status: 'active'
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center space-y-6 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900">Account Created!</h2>
          <p className="text-zinc-500">Welcome to RFID SaaS. Redirecting you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-zinc-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-10 gap-4 p-4">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full" />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-zinc-900 rounded-full border-t-transparent animate-spin-slow" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">RFID<span className="text-zinc-500">SaaS</span></span>
          </div>

          <h1 className="text-6xl font-bold text-white tracking-tighter leading-none mb-6">
            Start <br />
            Tracking <br />
            <span className="text-zinc-500 italic font-serif">Today.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
            Join hundreds of organizations using our enterprise-grade RFID attendance management system.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="w-12 h-12 bg-zinc-700 rounded-xl flex items-center justify-center text-white">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Secure by Design</p>
              <p className="text-zinc-500 text-xs">End-to-end encryption & HMAC signing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Create Account</h2>
            <p className="text-zinc-500 mt-2">Register your organization to get started</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3">
              <ShieldAlert size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Organization Name</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 transition-all text-sm"
                    placeholder="e.g. St. Mary's High School"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Admin Email</label>
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
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Get Started'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Already have an account? <Link href="/login" className="font-bold text-zinc-900 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
