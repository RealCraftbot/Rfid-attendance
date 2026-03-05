'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building, 
  Key, 
  Shield, 
  Save, 
  Copy, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { organization } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (organization?.name) {
      setOrgName(organization.name);
    }
  }, [organization]);

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const orgRef = doc(db, 'organizations', organization.id);
      await updateDoc(orgRef, { name: orgName });
      setMessage({ type: 'success', text: 'Organization settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
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

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your organization profile and security credentials</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
            : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Organization Profile */}
        <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-600">
              <Building size={20} />
            </div>
            <h3 className="font-bold text-zinc-900">Organization Profile</h3>
          </div>
          <form onSubmit={handleUpdateOrg} className="p-8 space-y-6">
            <div className="max-w-md space-y-4">
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
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Admin Email</label>
                <input 
                  type="email" 
                  disabled
                  value={organization?.admin_email || ''}
                  className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-400 text-sm cursor-not-allowed"
                />
                <p className="text-[10px] text-zinc-400 mt-1 font-medium italic">Email cannot be changed from the dashboard.</p>
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-95 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* API & Security */}
        <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-600">
              <Shield size={20} />
            </div>
            <h3 className="font-bold text-zinc-900">API & Security</h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-zinc-900">Organization ID</h4>
                <p className="text-xs text-zinc-500 mb-3">Unique identifier for your organization used by RFID devices.</p>
                <div className="flex gap-2">
                  <code className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-600 flex items-center">
                    {organization?.id || 'Loading...'}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(organization?.id || '')}
                    className="p-2.5 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-500 transition-colors"
                  >
                    {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-4">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600 h-fit">
                  <Key size={20} />
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
      </div>
    </div>
  );
}
