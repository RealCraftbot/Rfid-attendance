'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Cpu, 
  Trash2, 
  Key, 
  ShieldCheck, 
  ShieldAlert,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const deviceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  device_id: z.string().min(4, 'Device ID is required'),
  is_active: z.boolean().default(true),
});

export default function DevicesPage() {
  const { organization } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      is_active: true
    }
  });

  useEffect(() => {
    if (!organization?.id) return;

    const q = query(collection(db, 'organizations', organization.id, 'devices'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setDevices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [organization]);

  const generateSecret = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const onSubmit = async (data: any) => {
    if (!organization?.id) return;
    try {
      await addDoc(collection(db, 'organizations', organization.id, 'devices'), {
        ...data,
        secret_key: generateSecret(),
        created_at: new Date()
      });
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const toggleStatus = async (device: any) => {
    if (!organization?.id) return;
    const ref = doc(db, 'organizations', organization.id, 'devices', device.id);
    await updateDoc(ref, { is_active: !device.is_active });
  };

  const deleteDevice = async (id: string) => {
    if (!organization?.id || !confirm('Are you sure?')) return;
    await deleteDoc(doc(db, 'organizations', organization.id, 'devices', id));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Devices</h1>
          <p className="text-zinc-500 mt-1">Manage authorized RFID scanners and authentication keys</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-95"
        >
          <Plus size={20} />
          Register Device
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div key={device.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="p-6 border-b border-zinc-100">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl border ${
                  device.is_active ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                }`}>
                  <Cpu size={24} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleStatus(device)}
                    className={`p-2 rounded-lg transition-colors ${
                      device.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    {device.is_active ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                  </button>
                  <button 
                    onClick={() => deleteDevice(device.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900">{device.name}</h3>
              <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wider">{device.device_id}</p>
            </div>
            
            <div className="p-6 bg-zinc-50/50 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Secret Key</label>
                <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-3 py-2">
                  <Key size={14} className="text-zinc-400" />
                  <code className="flex-1 text-xs font-mono text-zinc-600 truncate">
                    ••••••••••••••••
                  </code>
                  <button 
                    onClick={() => copyToClipboard(device.secret_key, device.id + 'key')}
                    className="text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    {copiedId === device.id + 'key' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <span>Status</span>
                <span className={device.is_active ? 'text-emerald-600' : 'text-red-500'}>
                  {device.is_active ? 'Active &amp; Authorized' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {devices.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 space-y-4">
            <Cpu size={48} strokeWidth={1} />
            <div className="text-center">
              <p className="font-bold text-zinc-900">No devices registered</p>
              <p className="text-sm">Register your first ESP32 device to start scanning.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Register New Device</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <ShieldAlert size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Device Name</label>
                <input 
                  {...register('name')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="e.g. Main Entrance Scanner"
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Device ID (Hardware ID)</label>
                <input 
                  {...register('device_id')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm font-mono"
                  placeholder="e.g. ESP32_FRONT_01"
                />
                {errors.device_id && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.device_id.message}</p>}
              </div>
              
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                <RefreshCw size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  A unique <strong>Secret Key</strong> will be generated automatically. You&apos;ll need this to sign requests from your ESP32 hardware.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-50 text-zinc-600 font-bold rounded-xl hover:bg-zinc-100 transition-colors border border-zinc-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
                >
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
