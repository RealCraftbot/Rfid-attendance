'use client';


import React, { useState } from 'react';
import { 
  Receipt, 
  CreditCard, 
  TrendingUp,
  Plus,
  X,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Upload,
  Printer,
  Wallet
} from 'lucide-react';
import { format } from 'date-fns';

type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';

interface Fee {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidAmount: number;
}

interface Invoice {
  id: string;
  student: string;
  class: string;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  dueDate: string;
  items: string[];
  admissionNo: string;
  term: number;
  academicYear: string;
}

const NIGERIAN_FEE_TYPES = [
  'Tuition Fee',
  'Development Levy',
  'Laboratory Fee',
  'Sports Fee',
  'Library Fee',
  'ICT Fee',
  'Security Fee',
  'Medical Fee',
  'Examination Fee',
  'Uniform Fee',
  'Books Fee',
  'Transport Fee',
  'Feeding Fee',
  'Handbook Fee',
  'CASTER Fee',
  'WAEC Registration',
  'NECO Registration',
  'JAMB Registration',
];

const NIGERIAN_CLASSES = [
  'Nursery 1', 'Nursery 2', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SS 1', 'SS 2', 'SS 3'
];

const mockFees: Fee[] = [
  { id: '1', name: 'First Term Tuition', amount: 85000, dueDate: '2025-09-15', status: 'PAID', paidAmount: 85000 },
  { id: '2', name: 'Second Term Tuition', amount: 85000, dueDate: '2026-01-15', status: 'PARTIAL', paidAmount: 40000 },
  { id: '3', name: 'Third Term Tuition', amount: 85000, dueDate: '2026-04-15', status: 'PENDING', paidAmount: 0 },
  { id: '4', name: 'Development Levy', amount: 15000, dueDate: '2025-09-15', status: 'PAID', paidAmount: 15000 },
  { id: '5', name: 'Laboratory Fee', amount: 10000, dueDate: '2025-09-15', status: 'OVERDUE', paidAmount: 0 },
  { id: '6', name: 'ICT Fee', amount: 20000, dueDate: '2025-09-15', status: 'PAID', paidAmount: 20000 },
  { id: '7', name: 'Sports Fee', amount: 5000, dueDate: '2025-09-15', status: 'PAID', paidAmount: 5000 },
  { id: '8', name: 'WAEC Registration', amount: 35000, dueDate: '2026-02-28', status: 'PENDING', paidAmount: 0 },
];

const mockInvoices: Invoice[] = [
  { id: '1', student: 'Chukwuemeka Okafor', class: 'JSS 3A', admissionNo: 'GA/2020/001', amount: 135000, paidAmount: 135000, status: 'PAID', dueDate: '2025-09-15', term: 1, academicYear: '2025/2026', items: ['Tuition', 'Development Levy', 'Laboratory', 'ICT', 'Sports'] },
  { id: '2', student: 'Adaeze Nwosu', class: 'JSS 3A', admissionNo: 'GA/2020/002', amount: 135000, paidAmount: 90000, status: 'PARTIAL', dueDate: '2026-01-15', term: 2, academicYear: '2025/2026', items: ['Tuition'] },
  { id: '3', student: 'Oluwaseun Adebayo', class: 'SS 2 Science', admissionNo: 'GA/2019/015', amount: 185000, paidAmount: 0, status: 'PENDING', dueDate: '2025-09-15', term: 1, academicYear: '2025/2026', items: ['Tuition', 'WAEC Registration', 'Laboratory'] },
  { id: '4', student: 'Fatima Ibrahim', class: 'SS 3', admissionNo: 'GA/2018/008', amount: 220000, paidAmount: 0, status: 'OVERDUE', dueDate: '2025-09-15', term: 1, academicYear: '2025/2026', items: ['Tuition', 'WAEC Registration', 'NECO Registration'] },
];

const getStatusStyle = (status: PaymentStatus) => {
  const styles: Record<PaymentStatus, { bg: string; text: string; icon: any }> = {
    PAID: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
    PARTIAL: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
    PENDING: { bg: 'bg-blue-100', text: 'text-blue-700', icon: AlertCircle },
    OVERDUE: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
  };
  return styles[status];
};

export default function FeesPage() {
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const totalCollected = mockInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalExpected = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingPayments = mockInvoices.filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE').length;

  const filteredInvoices = mockInvoices.filter(inv => {
    const matchesSearch = inv.student.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">School Fees</h1>
          <p className="text-zinc-500 mt-1 text-sm sm:text-base">Manage fee structures and track payments</p>
        </div>
        <button 
          onClick={() => setShowAddInvoiceModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Wallet size={20} className="text-green-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Total Collected</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">₦{totalCollected.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt size={20} className="text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Total Expected</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">₦{totalExpected.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock size={20} className="text-amber-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Pending</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{pendingPayments}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Collection Rate</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{Math.round((totalCollected / totalExpected) * 100)}%</p>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-zinc-900">Fee Structure</h2>
          <button 
            onClick={() => setShowAddFeeModal(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Plus size={16} />
            Add Fee Type
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Fee Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Amount</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Due Date</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {mockFees.map((fee) => {
                const status = getStatusStyle(fee.status);
                const StatusIcon = status.icon;
                return (
                  <tr key={fee.id} className="hover:bg-zinc-50">
                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-medium text-zinc-900">{fee.name}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-medium text-zinc-900">₦{fee.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className="text-sm text-zinc-600">{format(new Date(fee.dueDate), 'MMM d, yyyy')}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                        <StatusIcon size={12} />
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-bold text-zinc-900">Recent Invoices</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm w-full sm:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-zinc-200 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Student</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Amount</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Paid</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Due Date</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredInvoices.map((invoice) => {
                const status = getStatusStyle(invoice.status);
                const StatusIcon = status.icon;
                return (
                  <tr key={invoice.id} className="hover:bg-zinc-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div>
                        <p className="font-medium text-zinc-900">{invoice.student}</p>
                        <p className="text-xs text-zinc-500">{invoice.class} • {invoice.admissionNo}</p>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-medium text-zinc-900">₦{invoice.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-medium text-green-600">₦{invoice.paidAmount.toLocaleString()}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                        <StatusIcon size={12} />
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className="text-sm text-zinc-600">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                        <CreditCard size={14} />
                        Pay
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fee Modal */}
      {showAddFeeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Add Fee Type</h3>
              <button onClick={() => setShowAddFeeModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Fee Name</label>
                <select className="w-full px-4 py-3 border border-zinc-200 rounded-xl">
                  <option>Select Fee Type</option>
                  {NIGERIAN_FEE_TYPES.map(fee => (
                    <option key={fee}>{fee}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Amount (₦)</label>
                <input type="number" placeholder="50000" className="w-full px-4 py-3 border border-zinc-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Due Date</label>
                  <input type="date" className="w-full px-4 py-3 border border-zinc-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Term</label>
                  <select className="w-full px-4 py-3 border border-zinc-200 rounded-xl">
                    <option>Term 1</option>
                    <option>Term 2</option>
                    <option>Term 3</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddFeeModal(false)} className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">Create Fee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
