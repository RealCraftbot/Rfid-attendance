'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Settings, 
  Building, 
  Key, 
  Shield, 
  Save, 
  Copy, 
  CheckCircle2,
  Upload,
  Image,
  X,
  User,
  Lock,
  Bell,
  Loader2
} from 'lucide-react';

// Role-based settings sections
type Role = 'ADMIN' | 'SUPER_ADMIN' | 'TEACHER' | 'PARENT' | 'BURSAR';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Organization {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
  email: string;
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const role = (session?.user?.role as Role) || 'PARENT';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Organization settings (Admin only)
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgName, setOrgName] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  
  // Personal profile settings (All roles)
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Notification preferences (All roles)
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    smsAlerts: false,
    paymentConfirmations: true,
    attendanceAlerts: true,
  });
  
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.success) {
        setProfile(prev => ({
          ...prev,
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
        }));
        
        if (data.organization) {
          setOrg(data.organization);
          setOrgName(data.organization.name || '');
          setOrgAddress(data.organization.address || '');
          setOrgPhone(data.organization.phone || '');
          setOrgLogo(data.organization.logoUrl || null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Logo must be less than 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrgLogo(reader.result as string);
        setMessage({ type: 'success', text: 'Logo selected. Click Save Changes to upload.' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setOrgLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName,
          address: orgAddress,
          phone: orgPhone,
          logoUrl: orgLogo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Organization settings updated successfully!' });
        if (data.organization) {
          setOrg(data.organization);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update organization' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update organization' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update session with new name
        await updateSession({ name: profile.name });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.newPassword !== profile.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: profile.currentPassword,
          newPassword: profile.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setProfile(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return 'Manage your organization profile, branding, and security credentials';
      case 'TEACHER':
        return 'Manage your personal profile and account settings';
      case 'BURSAR':
        return 'Manage your personal profile and account settings';
      case 'PARENT':
        return 'Manage your personal profile and notification preferences';
      default:
        return 'Manage your account settings';
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-zinc-500">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Settings</h1>
        <p className="text-zinc-500 mt-1 text-sm md:text-base">{getRoleTitle()}</p>
      </div>

      {message.text && (
        <div className={`p-3 md:p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
            : message.type === 'error'
            ? 'bg-red-50 text-red-600 border-red-100'
            : 'bg-blue-50 text-blue-600 border-blue-100'
        }`}>
          <CheckCircle2 size={18} />
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        
        {/* PERSONAL PROFILE - All Roles */}
        <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-zinc-100 bg-blue-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-blue-200 text-blue-600">
              <User size={18} className="md:w-5 md:h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-sm md:text-base">Personal Profile</h3>
          </div>
          <form onSubmit={handleUpdateProfile} className="p-4 md:p-8 space-y-4 md:space-y-6">
            <div className="max-w-md space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-400 text-sm cursor-not-allowed"
                />
                <p className="text-[10px] text-zinc-400 mt-1 font-medium italic">Email cannot be changed. Contact admin for assistance.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                <input 
                  type="tel" 
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="+234 801 234 5678"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 text-sm"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>

        {/* CHANGE PASSWORD - All Roles */}
        <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-600">
              <Lock size={18} className="md:w-5 md:h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-sm md:text-base">Change Password</h3>
          </div>
          <form onSubmit={handleUpdatePassword} className="p-4 md:p-8 space-y-4 md:space-y-6">
            <div className="max-w-md space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Current Password</label>
                <input 
                  type="password" 
                  value={profile.currentPassword}
                  onChange={(e) => setProfile(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">New Password</label>
                <input 
                  type="password" 
                  value={profile.newPassword}
                  onChange={(e) => setProfile(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                <input 
                  type="password" 
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={saving || !profile.currentPassword || !profile.newPassword || !profile.confirmPassword}
              className="flex items-center gap-2 bg-zinc-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-95 disabled:opacity-50 text-sm"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        {/* NOTIFICATION PREFERENCES - All Roles */}
        <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-600">
              <Bell size={18} className="md:w-5 md:h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-sm md:text-base">Notification Preferences</h3>
          </div>
          <div className="p-4 md:p-8 space-y-4">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications.emailUpdates}
                  onChange={(e) => setNotifications(prev => ({ ...prev, emailUpdates: e.target.checked }))}
                  className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-zinc-900">Email Updates</p>
                  <p className="text-xs text-zinc-500">Receive important updates via email</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications.smsAlerts}
                  onChange={(e) => setNotifications(prev => ({ ...prev, smsAlerts: e.target.checked }))}
                  className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-zinc-900">SMS Alerts</p>
                  <p className="text-xs text-zinc-500">Receive urgent notifications via SMS</p>
                </div>
              </label>
              
              {role === 'PARENT' && (
                <>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifications.paymentConfirmations}
                      onChange={(e) => setNotifications(prev => ({ ...prev, paymentConfirmations: e.target.checked }))}
                      className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">Payment Confirmations</p>
                      <p className="text-xs text-zinc-500">Get notified when payments are processed</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifications.attendanceAlerts}
                      onChange={(e) => setNotifications(prev => ({ ...prev, attendanceAlerts: e.target.checked }))}
                      className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">Attendance Alerts</p>
                      <p className="text-xs text-zinc-500">Get notified when your child checks in/out</p>
                    </div>
                  </label>
                </>
              )}
            </div>
            <button 
              onClick={() => setMessage({ type: 'success', text: 'Notification preferences saved!' })}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-sm"
            >
              <Save size={18} />
              Save Preferences
            </button>
          </div>
        </section>

        {/* ORGANIZATION SETTINGS - Admin Only */}
        {isAdmin && org && (
          <>
            <div className="pt-4 border-t border-zinc-200">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">Organization Settings</h2>
            </div>

            {/* School Branding */}
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 border-b border-zinc-100 bg-blue-50/50 flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-blue-200 text-blue-600">
                  <Image size={18} className="md:w-5 md:h-5" />
                </div>
                <h3 className="font-bold text-zinc-900 text-sm md:text-base">School Branding</h3>
              </div>
              <div className="p-4 md:p-8">
                <p className="text-xs text-zinc-500 mb-6">Upload your school logo. This will appear on all report cards, receipts, and printed documents.</p>
                
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center overflow-hidden">
                      {orgLogo ? (
                        <img src={orgLogo} alt="School Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="text-center text-zinc-400">
                          <Building size={32} className="mx-auto mb-1" />
                          <p className="text-xs">No logo</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 mb-1">School Logo</h4>
                      <p className="text-xs text-zinc-500 mb-3">PNG, JPG or WebP. Max 2MB. Recommended: 400x400px</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                        >
                          <Upload size={16} />
                          Upload Logo
                        </button>
                        {orgLogo && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                          >
                            <X size={16} />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-50 rounded-xl">
                      <p className="text-xs font-bold text-zinc-500 uppercase mb-3">Preview on Report Card</p>
                      <div className="bg-white rounded-lg p-4 border border-zinc-200 max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center overflow-hidden">
                            {orgLogo ? (
                              <img src={orgLogo} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <Building size={20} className="text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-blue-700 text-sm">{orgName || 'School Name'}</p>
                            <p className="text-xs text-zinc-500">{orgAddress || 'School Address'}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-100 text-center">
                          <p className="text-xs font-bold text-zinc-900">TERMINAL REPORT</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Organization Profile */}
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-600">
                  <Building size={18} className="md:w-5 md:h-5" />
                </div>
                <h3 className="font-bold text-zinc-900 text-sm md:text-base">Organization Profile</h3>
              </div>
              <form onSubmit={handleUpdateOrg} className="p-4 md:p-8 space-y-4 md:space-y-6">
                <div className="max-w-md space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Organization Name</label>
                    <input 
                      type="text" 
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                      placeholder="e.g. St. Mary's High School"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">School Address</label>
                    <input 
                      type="text" 
                      value={orgAddress}
                      onChange={(e) => setOrgAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                      placeholder="123 Education Street, Lagos, Nigeria"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">School Phone</label>
                    <input 
                      type="tel" 
                      value={orgPhone}
                      onChange={(e) => setOrgPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                      placeholder="+234 801 234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Admin Email</label>
                    <input 
                      type="email" 
                      disabled
                      value={org?.email || ''}
                      className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-400 text-sm cursor-not-allowed"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium italic">Email cannot be changed from the dashboard.</p>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-zinc-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-95 disabled:opacity-50 text-sm"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </section>

            {/* API & Security */}
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-600">
                  <Shield size={18} className="md:w-5 md:h-5" />
                </div>
                <h3 className="font-bold text-zinc-900 text-sm md:text-base">API & Security</h3>
              </div>
              <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">Organization ID</h4>
                    <p className="text-xs text-zinc-500 mb-2 md:mb-3">Unique identifier for your organization used by RFID devices.</p>
                    <div className="flex gap-2">
                      <code className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs md:text-sm font-mono text-zinc-600 flex items-center overflow-hidden">
                        {org?.id || ''}
                      </code>
                      <button 
                        onClick={() => org?.id && copyToClipboard(org.id)}
                        className="p-2 md:p-2.5 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-500 transition-colors"
                      >
                        {copied ? <CheckCircle2 size={16} className="md:w-[18px] md:h-[18px] text-emerald-500" /> : <Copy size={16} className="md:w-[18px] md:h-[18px]" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 md:p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 md:gap-4">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600 h-fit shrink-0">
                      <Key size={18} className="md:w-5 md:h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Device Security</h4>
                      <p className="text-xs text-amber-700 leading-relaxed mt-1">
                        Each RFID device must be registered in the <span className="font-bold underline">Devices</span> tab. 
                        During registration, a unique <span className="font-mono">secret_key</span> will be generated for HMAC signing. 
                        Never share these keys publicly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
