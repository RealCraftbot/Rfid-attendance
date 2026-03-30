'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import OTPVerification from '@/components/OTPVerification';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Check if already verified
    if (status === 'authenticated') {
      if (session?.user?.emailVerified) {
        // Already verified, redirect to dashboard
        const role = session.user.role;
        switch (role) {
          case 'SUPER_ADMIN':
            router.push('/super-admin');
            break;
          case 'ADMIN':
            router.push('/dashboard');
            break;
          case 'BURSAR':
            router.push('/dashboard/bursar');
            break;
          case 'PARENT':
            router.push('/dashboard/parent');
            break;
          case 'TEACHER':
            router.push('/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        // Use microtask to avoid synchronous setState in effect
        Promise.resolve().then(() => {
          setEmail(session.user.email);
          setLoading(false);
        });
      }
    }
  }, [status, session, router]);

  const handleVerified = async () => {
    try {
      // Update user's emailVerified status
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Update session
        await update({ emailVerified: new Date().toISOString() });
        setVerified(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          const role = session?.user?.role;
          switch (role) {
            case 'SUPER_ADMIN':
              router.push('/super-admin');
              break;
            case 'ADMIN':
              router.push('/dashboard');
              break;
            case 'BURSAR':
              router.push('/dashboard/bursar');
              break;
            case 'PARENT':
              router.push('/dashboard/parent');
              break;
            case 'TEACHER':
              router.push('/dashboard');
              break;
            default:
              router.push('/dashboard');
          }
        }, 2000);
      } else {
        alert('Failed to verify email. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to verify email. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/login');
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Email Verified!</h1>
          <p className="text-zinc-600 mb-4">
            Your email has been successfully verified. Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Verify Your Email</h1>
          <p className="text-zinc-600 mt-2">
            Please verify your email address to access your account
          </p>
        </div>

        <OTPVerification
          email={email}
          onVerified={handleVerified}
          onCancel={handleCancel}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500">
            Didn&apos;t receive the code? Check your spam folder or{' '}
            <button 
              onClick={handleCancel}
              className="text-blue-600 hover:underline"
            >
              try logging in again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
