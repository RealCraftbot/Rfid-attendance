'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Baby,
  FileText,
  History,
  Wallet
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function ParentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        role: 'PARENT',
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard/parent');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <Link 
        href="/login"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors z-10"
      >
        <ArrowLeft size={20} />
        <span className="font-medium text-sm sm:text-base">Back</span>
      </Link>

      <div className="w-full max-w-md px-4 sm:px-0">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-block mb-4 sm:mb-6">
            <Logo textColor="text-zinc-900" subtextColor="text-zinc-500" />
          </Link>
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl shadow-green-200">
            <Baby size={32} className="text-white sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-1 sm:mb-2">Parent Login</h1>
          <p className="text-sm sm:text-base text-zinc-500">Monitor your children's progress</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-zinc-700 mb-1.5 sm:mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                  placeholder="parent@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-zinc-700 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-zinc-300 text-green-600 focus:ring-green-500" />
                <span className="text-zinc-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-green-600 hover:text-green-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 sm:py-4 bg-green-600 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Signing in...</span>
                </>
              ) : (
                <span className="text-sm sm:text-base">View Children</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500">
            <p>Don&apos;t have an account? <Link href="/parent-signup" className="font-bold text-green-600 hover:underline">Register here</Link></p>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100">
            <div className="flex flex-wrap justify-center gap-3 text-sm text-zinc-600">
              <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                Admin
              </Link>
              <Link href="/login/teacher" className="text-green-600 hover:text-green-700 font-medium">
                Teacher
              </Link>
              <Link href="/login/bursar" className="text-green-600 hover:text-green-700 font-medium">
                Bursar
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center p-2 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <History size={20} className="text-blue-600 sm:w-6 sm:h-6" />
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-600">Attendance</p>
          </div>
          <div className="text-center p-2 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <Wallet size={20} className="text-amber-600 sm:w-6 sm:h-6" />
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-600">Pay Fees</p>
          </div>
          <div className="text-center p-2 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <FileText size={20} className="text-green-600 sm:w-6 sm:h-6" />
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-600">Reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}
