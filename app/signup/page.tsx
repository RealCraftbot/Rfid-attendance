'use client';

import React, { useState } from 'react';
import { UserPlus, Mail, Lock, ArrowRight, Building, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

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
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, orgName }),
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
    <div className="min-h-screen bg-zinc-50 flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-12 flex-col justify-center">
        <div className="max-w-lg">
          <Link href="/" className="block mb-12">
            <Logo textColor="text-white" subtextColor="text-purple-300" />
          </Link>

          <h1 className="text-5xl font-bold text-white tracking-tight mb-6">
            Start managing attendance in minutes
          </h1>
          <p className="text-blue-100/80 text-lg mb-8">
            Set up your organization, connect your RFID devices, and start tracking attendance in real-time.
          </p>

          <div className="space-y-4">
            {['Quick 5-minute setup', 'No hardware required to start', 'Free tier available'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="text-green-400" size={20} />
                <span className="text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900">Create Organization</h2>
            <p className="text-zinc-500 mt-2">Get started with your free account</p>
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
              Organization created! Redirecting...
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
                    placeholder="Acme School"
                  />
                </div>
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
                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 transition-all text-sm"
                    placeholder="admin@acme.edu"
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
              {loading ? 'Creating...' : 'Create Organization'}
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
