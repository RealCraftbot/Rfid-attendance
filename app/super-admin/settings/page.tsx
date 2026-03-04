'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Database, 
  Globe, 
  Save, 
  CheckCircle2,
  AlertCircle,
  Server,
  Lock
} from 'lucide-react';

export default function SuperAdminSettings() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    // Simulate saving system settings
    setTimeout(() => {
      setMessage({ type: 'success', text: 'System settings updated successfully!' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">System Settings</h1>
        <p className="text-zinc-500 mt-1">Configure global platform parameters and security policies</p>
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
        {/* Platform Configuration */}
        <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-600">
              <Globe size={20} />
            </div>
            <h3 className="font-bold text-zinc-900">Platform Configuration</h3>
          </div>
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Platform Name</label>
                <input 
                  type="text" 
                  defaultValue="RFID SaaS Platform"
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Support Email</label>
                <input 
                  type="email" 
                  defaultValue="support@rfidsaas.com"
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Default Organization Plan</label>
                <select className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm">
                  <option>Free Tier</option>
                  <option>Professional</option>
                  <option>Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">System Status</label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-sm font-bold w-fit">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Operational
                </div>
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

        {/* Security & Infrastructure */}
        <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-600">
              <Shield size={20} />
            </div>
            <h3 className="font-bold text-zinc-900">Security & Infrastructure</h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-zinc-100 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-zinc-900 font-bold">
                  <Lock size={18} className="text-zinc-400" />
                  Authentication
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Multi-factor authentication is currently <span className="text-emerald-600 font-bold">Enabled</span> for all Super Admin accounts.
                </p>
                <button className="text-xs font-bold text-zinc-900 hover:underline">Configure MFA</button>
              </div>
              <div className="p-4 border border-zinc-100 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-zinc-900 font-bold">
                  <Server size={18} className="text-zinc-400" />
                  Database Backups
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Automated daily backups are active. Last backup: <span className="font-mono">2024-03-04 00:00 UTC</span>
                </p>
                <button className="text-xs font-bold text-zinc-900 hover:underline">View Backup Logs</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
