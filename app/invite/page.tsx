'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Loader2, Lock, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation token');
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setValidating(true);
      const response = await fetch(`/api/invite/validate?token=${token}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Invalid or expired invitation');
        return;
      }

      setEmail(data.data.email);
      setName(data.data.name);
      setRole(data.data.role || '');
    } catch (err) {
      setError('Failed to validate invitation');
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setValidating(true);
      const response = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to set password');
      }

      setSuccess(true);
      setTimeout(() => {
        // Redirect to the appropriate login page based on role
        if (role === 'TEACHER') {
          router.push('/login/teacher');
        } else if (role === 'BURSAR') {
          router.push('/login/bursar');
        } else if (role === 'PARENT') {
          router.push('/login/parent');
        } else {
          router.push('/login');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to set password');
    } finally {
      setValidating(false);
    }
  };

  if (loading || validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-zinc-600">
            {loading ? 'Loading...' : 'Processing...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Invalid Invitation</h1>
          <p className="text-zinc-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Password Set!</h1>
          <p className="text-zinc-600 mb-4">
            Your account is ready. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Accept Invitation</h1>
          <p className="text-zinc-600 mt-2">
            Set your password to access your account
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 p-3 bg-zinc-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">{name}</p>
              <p className="text-xs text-zinc-500">{email}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="password"
                  {...register('password')}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-900 text-sm"
                  placeholder="Min 8 characters"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-900 text-sm"
                  placeholder="Confirm password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={validating}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {validating ? 'Setting Password...' : 'Set Password'}
              {!validating && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
