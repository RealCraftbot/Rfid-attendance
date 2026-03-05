'use client';

import React, { useState, use } from 'react';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  ArrowRight,
  Building,
  ShieldAlert,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Home,
  FileText,
  User,
  Camera,
  Loader2
} from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Image from 'next/image';

interface ParentSignupPageProps {
  searchParams: Promise<{ orgId?: string }>;
}

export default function ParentSignupPage({ searchParams }: ParentSignupPageProps) {
  const params = use(searchParams);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentType, setParentType] = useState<'dad' | 'mom' | 'guardian'>('dad');
  const [orgId, setOrgId] = useState(params.orgId || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>('');
  const [uploadingPic, setUploadingPic] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePic = async (userId: string): Promise<string | null> => {
    if (!profilePic) return null;
    setUploadingPic(true);
    try {
      const fileRef = storageRef(storage, `profile_pics/${userId}`);
      await uploadBytes(fileRef, profilePic);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (err) {
      console.error('Error uploading profile pic:', err);
      return null;
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!auth || !db) {
        throw new Error('Firebase is not initialized. Please check your configuration.');
      }

      if (!orgId) {
        throw new Error('Organization ID is required. Please contact your school for the registration link.');
      }

      // Check if organization exists
      const orgRef = doc(db, 'organizations', orgId);
      const orgSnap = await getDoc(orgRef);
      if (!orgSnap.exists()) {
        throw new Error('Invalid organization. Please contact your school for the correct registration link.');
      }

      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Upload profile picture if selected
      let photoURL = '';
      if (profilePic) {
        const uploadedURL = await uploadProfilePic(user.uid);
        if (uploadedURL) {
          photoURL = uploadedURL;
          await updateProfile(user, { photoURL: uploadedURL });
        }
      }

      // 3. Update Auth profile with name
      await updateProfile(user, { displayName: parentName });

      // 4. Create Parent User Document
      await setDoc(doc(db, 'users', user.uid), {
        name: parentName,
        parentType: parentType,
        email: email,
        phone: phone,
        address: address,
        idNumber: idNumber,
        photoURL: photoURL,
        org_id: orgId,
        role: 'parent',
        is_active: true,
        created_at: new Date(),
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
          <p className="text-zinc-500">Welcome! Redirecting you to view your children's attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-brand-navy p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
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
            Parent <br />
            Portal
          </h1>
          <p className="text-brand-purple/60 text-lg max-w-md leading-relaxed">
            Monitor your children&apos;s school attendance and stay connected with their education.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="w-12 h-12 bg-brand-blue rounded-xl flex items-center justify-center text-white">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Real-time Updates</p>
              <p className="text-brand-purple/40 text-xs">Get instant notifications when your child arrives or leaves school</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Parent Registration</h2>
            <p className="text-zinc-500 mt-2">Create your parent account to monitor your children</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3">
              <ShieldAlert size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Organization ID *</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 transition-all text-sm"
                    placeholder="Enter organization ID from school"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 transition-all text-sm"
                    placeholder="e.g. John Smith"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">I am a *</label>
                <div className="flex gap-3">
                  {[
                    { value: 'dad', label: 'Dad', emoji: '👨' },
                    { value: 'mom', label: 'Mom', emoji: '👩' },
                    { value: 'guardian', label: 'Guardian', emoji: '👤' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setParentType(type.value as 'dad' | 'mom' | 'guardian')}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                        parentType === type.value 
                          ? 'border-brand-blue bg-brand-blue text-white' 
                          : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      {type.emoji} {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 transition-all text-sm"
                    placeholder="parent@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 transition-all text-sm"
                      placeholder="+2348012345678"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Password *</label>
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
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Address *</label>
                <div className="relative">
                  <Home className="absolute left-4 top-3 text-zinc-400" size={18} />
                  <textarea 
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 transition-all text-sm min-h-[80px]"
                    placeholder="Your residential address"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">ID Number (NIN/Voter's Card) *</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 transition-all text-sm"
                    placeholder="Government issued ID number"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register'}
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
