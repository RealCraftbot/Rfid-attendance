'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  UserCog,
  Shield,
  User,
  XCircle as XCircleIcon,
  Loader2,
  Mail,
  Send
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSession } from 'next-auth/react';

const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['teacher', 'admin', 'bursar']),
});

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  passwordSet?: boolean;
  invitationSentAt?: string | null;
}

export default function StaffPage() {
  const { data: session } = useSession();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitingStaff, setInvitingStaff] = useState<StaffMember | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'teacher'
    }
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/staff');
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }
      const data = await response.json();
      setStaff(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingStaff(null);
    reset({ name: '', email: '', role: 'teacher' });
    setIsModalOpen(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    reset({ 
      name: member.name, 
      email: member.email, 
      role: member.role === 'TEACHER' ? 'teacher' : 'admin' 
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof staffSchema>) => {
    try {
      const roleMap: Record<string, string> = {
        teacher: 'TEACHER',
        admin: 'ADMIN',
        bursar: 'BURSAR',
      };
      
      const payload = {
        name: data.name,
        email: data.email,
        role: roleMap[data.role] || 'TEACHER',
      };
      
      const url = editingStaff ? '/api/staff' : '/api/staff';
      const method = editingStaff ? 'PUT' : 'POST';
      const body = editingStaff ? { ...payload, id: editingStaff.id } : payload;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        console.error('Staff API error:', result);
        throw new Error(result.error || result.error?.message || 'Failed to save staff member');
      }
      
      await fetchStaff();
      setIsModalOpen(false);
      setEditingStaff(null);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save staff member');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const member = staff.find(s => s.id === id);
      if (!member) return;

      const response = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isActive: !member.isActive
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      await fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const deleteStaff = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      const response = await fetch(`/api/staff?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete staff member');
      }
      
      await fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete staff member');
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = async () => {
    if (!invitingStaff) return;
    
    try {
      setInviteLoading(true);
      const response = await fetch('/api/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: invitingStaff.email }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send invitation');
      }
      
      await fetchStaff();
      setIsInviteModalOpen(false);
      setInvitingStaff(null);
      alert('Invitation sent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const openInviteModal = (member: StaffMember) => {
    setInvitingStaff(member);
    setIsInviteModalOpen(true);
  };

  const currentUserRole = session?.user?.role;

  if (currentUserRole !== 'ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-zinc-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Staff Management</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Manage teachers and administrative staff</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 active:scale-95 text-sm"
        >
          <Plus size={18} />
          Add Staff Member
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <XCircle size={18} />
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <XCircleIcon size={16} />
          </button>
        </div>
      )}

      <div className="bg-white p-3 md:p-4 rounded-2xl border border-zinc-200 flex flex-wrap gap-3 md:gap-4 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full sm:min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-200">
                <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest">Staff Member</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:table-cell">Role</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:table-cell">Invite</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest text-right hidden sm:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-3 md:px-6 py-16 md:py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-400 space-y-4">
                      <Loader2 size={40} className="md:w-12 md:h-12 animate-spin" strokeWidth={1.5} />
                      <p className="text-sm">Loading staff members...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold border border-zinc-200">
                          {member.name?.charAt(0) || member.email?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900 truncate">{member.name || 'Unnamed'}</p>
                          <p className="text-[10px] md:text-xs text-zinc-500 hidden sm:block truncate">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold border ${
                        member.role === 'admin' 
                          ? 'bg-brand-blue/5 text-brand-blue border-brand-blue/10' 
                          : member.role === 'parent'
                          ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
                          : 'bg-brand-purple/5 text-brand-purple border-brand-purple/10'
                      }`}>
                        {member.role === 'admin' && <Shield size={10} className="md:w-3 md:h-3" />}
                        {member.role === 'teacher' && <UserCog size={10} className="md:w-3 md:h-3" />}
                        {member.role === 'parent' && <User size={10} className="md:w-3 md:h-3" />}
                        {member.role === 'admin' ? 'Admin' : member.role === 'parent' ? 'Parent' : 'Teacher'}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <button 
                        onClick={() => toggleStatus(member.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border ${
                          member.isActive 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}
                      >
                        {member.isActive ? <CheckCircle2 size={10} className="md:w-3 md:h-3" /> : <XCircle size={10} className="md:w-3 md:h-3" />}
                        {member.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                      {(member as any).passwordSet ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <CheckCircle2 size={10} className="md:w-3 md:h-3" />
                          Set
                        </span>
                      ) : (
                        <button
                          onClick={() => openInviteModal(member)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                          <Send size={10} className="md:w-3 md:h-3" />
                          Send Invite
                        </button>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <button 
                          onClick={() => openEditModal(member)}
                          className="p-1.5 md:p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} className="md:w-4 md:h-4" />
                        </button>
                        <button 
                          onClick={() => deleteStaff(member.id)}
                          className="p-1.5 md:p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} className="md:w-4 md:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredStaff.length === 0 && (
          <div className="py-16 md:py-20 flex flex-col items-center justify-center text-zinc-400 space-y-4">
            <div className="p-4 bg-zinc-50 rounded-full">
              <UserCog size={40} className="md:w-12 md:h-12" strokeWidth={1} />
            </div>
            <div className="text-center">
              <p className="font-bold text-zinc-900">No staff members found</p>
              <p className="text-sm">Add your first teacher or administrator.</p>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingStaff(null); }} className="text-zinc-400 hover:text-zinc-900">
                <XCircleIcon size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Full Name</label>
                <input 
                  {...register('name')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="e.g. Jane Smith"
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input 
                  {...register('email')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                  placeholder="jane@school.com"
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Role</label>
                <select 
                  {...register('role')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-100 text-sm"
                >
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
                {errors.role && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.role.message}</p>}
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingStaff(null); }}
                  className="flex-1 py-3 bg-zinc-50 text-zinc-600 font-bold rounded-xl hover:bg-zinc-100 transition-colors border border-zinc-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
                >
                  {editingStaff ? 'Update Staff' : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Send Invitation</h3>
              <button onClick={() => { setIsInviteModalOpen(false); setInvitingStaff(null); }} className="text-zinc-400 hover:text-zinc-900">
                <XCircleIcon size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {invitingStaff?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{invitingStaff?.name}</p>
                  <p className="text-sm text-zinc-500">{invitingStaff?.email}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-600">
                An invitation email will be sent with a link to set their password and access their dashboard.
              </p>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setIsInviteModalOpen(false); setInvitingStaff(null); }}
                  className="flex-1 py-3 bg-zinc-50 text-zinc-600 font-bold rounded-xl hover:bg-zinc-100 transition-colors border border-zinc-200"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleInvite}
                  disabled={inviteLoading}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  {!inviteLoading && <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
