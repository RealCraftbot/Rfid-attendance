'use client';

import React, { useState } from 'react';
import { UserPlus, Mail, Lock, ArrowRight, ShieldAlert, CheckCircle2, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function ParentSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/parents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: parentName, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8">
            <Logo textColor="text-zinc-900" subtextColor="text-zinc-500" />
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900">Parent Registration</h1>
          <p className="text-zinc-500 mt-2">Create an account to track your child&apos;s attendance</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 text-sm flex items-center gap-3">
            <ShieldAlert size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-green-600 text-sm flex items-center gap-3">
            <CheckCircle2 size={18} />
            Account created! Redirecting...
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6 bg-white p-8 rounded-xl border border-zinc-200 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Parent Name</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-900 text-sm"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-900 text-sm"
                  placeholder="parent@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-900 text-sm"
                  placeholder="+1234567890"
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
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-900 text-sm"
                  placeholder="Min 8 characters"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account? <Link href="/login" className="font-bold text-zinc-900 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
