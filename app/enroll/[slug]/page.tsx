'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { prisma } from '@/lib/prisma';
import { Upload, Check, ChevronRight, User, Phone, FileText, Loader2 } from 'lucide-react';
import StepIndicator from '@/components/enrollment/StepIndicator';

const STEPS = [
  { id: 1, label: 'Student Bio', description: 'Personal details' },
  { id: 2, label: 'Parent Contact', description: 'Guardian info' },
  { id: 3, label: 'Documents', description: 'Upload files' },
];

interface Step1Data {
  studentName: string;
  studentDob: string;
  studentGender: 'Male' | 'Female' | 'Other';
  gradeApplying: string;
}

interface Step2Data {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  relationship: string;
}

interface Step3Data {
  passportUrl: string;
  birthCertUrl: string;
}

export default async function EnrollPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState('');

  const [step1Data, setStep1Data] = useState<Step1Data>({
    studentName: '',
    studentDob: '',
    studentGender: 'Male',
    gradeApplying: '',
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    relationship: 'Father',
  });

  const [step3Data, setStep3Data] = useState<Step3Data>({
    passportUrl: '',
    birthCertUrl: '',
  });

  const handleStep1Submit = () => {
    if (!step1Data.studentName || !step1Data.gradeApplying) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2Submit = () => {
    if (!step2Data.parentName || !step2Data.parentEmail || !step2Data.parentPhone) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/enroll/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgSlug: slug,
          step1: step1Data,
          step2: step2Data,
          step3: step3Data,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit');
      }

      setEnrollmentId(data.data?.enrollmentId || '');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-blue flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-brand-green mx-auto mb-6 flex items-center justify-center"
            style={{ boxShadow: '0 0 30px rgba(63, 242, 156, 0.4)' }}
          >
            <Check className="w-10 h-10 text-brand-navy" />
          </motion.div>
          <h1 className="text-2xl font-bold text-brand-navy mb-3">Enrollment Submitted!</h1>
          <p className="text-zinc-600 mb-6">
            Your application has been received. We will review and get back to you within 24 hours.
          </p>
          <div className="bg-brand-green/10 rounded-xl p-4 text-left">
            <p className="text-sm text-zinc-500">Application ID</p>
            <p className="font-mono text-brand-navy">{enrollmentId}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-navy to-brand-blue/80 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Speedy Enrollment</h1>
          <p className="text-brand-purple">Join our school in minutes</p>
        </motion.div>

        <StepIndicator steps={STEPS} currentStep={step} />

        <div className="mt-20 bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-5"
              >
                <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2">
                  <User className="w-5 h-5 text-brand-blue" /> Student Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={step1Data.studentName}
                    onChange={(e) => setStep1Data({ ...step1Data, studentName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-brand-blue focus:ring-0 transition-colors"
                    placeholder="Enter student full name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={step1Data.studentDob}
                      onChange={(e) => setStep1Data({ ...step1Data, studentDob: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-brand-blue focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Gender</label>
                    <select
                      value={step1Data.studentGender}
                      onChange={(e) => setStep1Data({ ...step1Data, studentGender: e.target.value as any })}
                      className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-brand-blue focus:ring-0"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Grade Applying For *</label>
                  <input
                    type="text"
                    value={step1Data.gradeApplying}
                    onChange={(e) => setStep1Data({ ...step1Data, gradeApplying: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-brand-blue focus:ring-0"
                    placeholder="e.g., Grade 1, JSS 1, SS 1"
                  />
                </div>

                <motion.button
                  onClick={handleStep1Submit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-5"
              >
                <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2">
                  <Phone className="w-5 h-5 text-brand-blue" /> Parent/Guardian Contact
                </h2>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={step2Data.parentName}
                    onChange={(e) => setStep2Data({ ...step2Data, parentName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-brand-blue focus:ring-0"
                    placeholder="Enter parent/guardian name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={step2Data.parentEmail}
                    onChange={(e) => setStep2Data({ ...step2Data, parentEmail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-brand-blue focus:ring-0"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={step2Data.parentPhone}
                      onChange={(e) => setStep2Data({ ...step2Data, parentPhone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-brand-blue focus:ring-0"
                      placeholder="+234..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Relationship</label>
                    <select
                      value={step2Data.relationship}
                      onChange={(e) => setStep2Data({ ...step2Data, relationship: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-brand-blue focus:ring-0"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setStep(1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-zinc-100 text-zinc-700 py-4 rounded-xl font-bold"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={handleStep2Submit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-brand-blue text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-5"
              >
                <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-blue" /> Documents (Optional)
                </h2>

                <div className="bg-zinc-50 rounded-xl p-4 border-2 border-dashed border-zinc-200">
                  <div className="flex flex-col items-center justify-center py-6">
                    <Upload className="w-10 h-10 text-zinc-400 mb-2" />
                    <p className="text-sm text-zinc-600 mb-1">Passport Photograph</p>
                    <p className="text-xs text-zinc-400">Upload clear passport-size photo</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 rounded-xl p-4 border-2 border-dashed border-zinc-200">
                    <div className="flex flex-col items-center justify-center py-4">
                      <FileText className="w-8 h-8 text-zinc-400 mb-2" />
                      <p className="text-sm text-zinc-600">Birth Certificate</p>
                    </div>
                  </div>
                  <div className="bg-zinc-50 rounded-xl p-4 border-2 border-dashed border-zinc-200">
                    <div className="flex flex-col items-center justify-center py-4">
                      <FileText className="w-8 h-8 text-zinc-400 mb-2" />
                      <p className="text-sm text-zinc-600">Other Documents</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-zinc-500 text-center">
                  You can upload documents later via the portal after approval
                </p>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setStep(2)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-zinc-100 text-zinc-700 py-4 rounded-xl font-bold"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-brand-green text-brand-navy py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ boxShadow: '0 0 20px rgba(63, 242, 156, 0.3)' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" /> Submit Application
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}