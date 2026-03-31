'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, CheckCircle2, RefreshCw } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onVerified: () => void;
  onCancel: () => void;
}

export default function OTPVerification({ email, onVerified, onCancel }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all digits entered
    if (index === 5 && value) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp);
      // Focus last filled input
      const lastIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastIndex]?.focus();
      
      if (pastedData.length === 6) {
        verifyOTP(pastedData);
      }
    }
  };

  const verifyOTP = async (otpCode: string) => {
    if (otpCode.length !== 6) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onVerified();
        }, 1000);
      } else {
        setError(data.error || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setCountdown(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {success ? (
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          ) : (
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>
        {success ? (
          <>
            <h2 className="text-2xl font-bold text-zinc-900">Verified!</h2>
            <p className="text-zinc-500 mt-2">Your email has been verified successfully.</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-zinc-900">Enter Verification Code</h2>
            <p className="text-zinc-500 mt-2">Enter the 6-digit code sent to {email}</p>
          </>
        )}
      </div>

      {!success && (
        <>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={loading}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-zinc-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-zinc-50"
              />
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Verifying...</span>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-zinc-500 mb-2">
              Didn&apos;t receive the code?
            </p>
            {countdown > 0 ? (
              <p className="text-sm text-zinc-400">
                Resend in {countdown}s
              </p>
            ) : (
              <button
                onClick={resendOTP}
                disabled={sending}
                className="flex items-center gap-2 mx-auto text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend OTP
                  </>
                )}
              </button>
            )}
          </div>

          <button
            onClick={onCancel}
            className="w-full mt-6 py-3 text-zinc-500 hover:text-zinc-700 font-medium"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
