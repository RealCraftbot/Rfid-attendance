'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Wallet,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Banknote,
  TrendingUp,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Check,
  X,
  Building2,
  Plus,
  Receipt,
  CreditCard,
  Trash2,
  Edit3,
  ArrowUpDown,
  History
} from 'lucide-react';
import { format } from 'date-fns';

// Types
interface PaymentTransaction {
  id: string;
  invoiceId: string;
  studentName: string;
  studentClass: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'POS' | 'ONLINE';
  transactionStatus: 'PENDING' | 'PROCESSING' | 'VERIFIED' | 'REJECTED' | 'COMPLETED';
  proofOfPaymentUrl?: string;
  paidByName: string;
  paidByEmail: string;
  paidByPhone: string;
  transactionDate: string;
  transactionRef?: string;
  notes?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
}

interface FeeStructure {
  id: string;
  name: string;
  description?: string;
  amount: number;
  dueDate: string;
  academicYear: string;
  term: number;
  isActive: boolean;
  createdAt: string;
}

interface Invoice {
  id: string;
  studentName: string;
  studentClass: string;
  admissionNumber: string;
  amount: number;
  paidAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  dueDate: string;
  academicYear: string;
  term: number;
  feeName: string;
}

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
  accountType: string;
  isDefault: boolean;
  isActive: boolean;
}

interface AdminStats {
  totalRevenue: number;
  totalExpected: number;
  collectionRate: number;
  pendingPayments: number;
  overduePayments: number;
  verifiedToday: number;
  totalStudents: number;
  paidStudents: number;
}

// Mock data
const mockTransactions: PaymentTransaction[] = [
  {
    id: 'pay1',
    invoiceId: 'inv1',
    studentName: 'Chukwuemeka Okafor',
    studentClass: 'Primary 5',
    amount: 50000,
    paymentMethod: 'BANK_TRANSFER',
    transactionStatus: 'PENDING',
    paidByName: 'Mr. Okafor',
    paidByEmail: 'okafor@email.com',
    paidByPhone: '08012345678',
    transactionDate: '2025-12-15T10:30:00Z',
    transactionRef: 'TRX123456789',
    notes: 'First term tuition fee payment',
  },
  {
    id: 'pay2',
    invoiceId: 'inv2',
    studentName: 'Adaeze Nwosu',
    studentClass: 'Primary 5',
    amount: 50000,
    paymentMethod: 'BANK_TRANSFER',
    transactionStatus: 'VERIFIED',
    paidByName: 'Mrs. Nwosu',
    paidByEmail: 'nwosu@email.com',
    paidByPhone: '08087654321',
    transactionDate: '2025-12-14T14:20:00Z',
    transactionRef: 'TRX987654321',
    reviewedByName: 'Mr. Adeyemi (Bursar)',
    reviewedAt: '2025-12-14T16:00:00Z',
    reviewNotes: 'Payment confirmed from bank statement',
  },
  {
    id: 'pay3',
    invoiceId: 'inv3',
    studentName: 'Oluwaseun Adebayo',
    studentClass: 'JSS 2',
    amount: 55000,
    paymentMethod: 'CASH',
    transactionStatus: 'COMPLETED',
    paidByName: 'Mr. Adebayo',
    paidByEmail: 'adebayo@email.com',
    paidByPhone: '08023456789',
    transactionDate: '2025-12-13T09:00:00Z',
    reviewedByName: 'Mr. Adeyemi (Bursar)',
    reviewedAt: '2025-12-13T10:00:00Z',
  },
  {
    id: 'pay4',
    invoiceId: 'inv4',
    studentName: 'Fatima Ibrahim',
    studentClass: 'SS 3',
    amount: 60000,
    paymentMethod: 'CHEQUE',
    transactionStatus: 'REJECTED',
    paidByName: 'Alhaji Ibrahim',
    paidByEmail: 'ibrahim@email.com',
    paidByPhone: '08034567890',
    transactionDate: '2025-12-12T11:00:00Z',
    transactionRef: 'CHQ001234',
    reviewedByName: 'Mr. Adeyemi (Bursar)',
    reviewedAt: '2025-12-12T14:00:00Z',
    rejectionReason: 'Cheque bounced - insufficient funds',
  },
  {
    id: 'pay5',
    invoiceId: 'inv5',
    studentName: 'Emmanuel Chidi',
    studentClass: 'Primary 3',
    amount: 45000,
    paymentMethod: 'POS',
    transactionStatus: 'COMPLETED',
    paidByName: 'Mrs. Chidi',
    paidByEmail: 'chidi@email.com',
    paidByPhone: '08045678901',
    transactionDate: '2025-12-15T08:15:00Z',
    transactionRef: 'POS567890',
    reviewedByName: 'Admin User',
    reviewedAt: '2025-12-15T09:30:00Z',
  },
  {
    id: 'pay6',
    invoiceId: 'inv6',
    studentName: 'Blessing Okonkwo',
    studentClass: 'JSS 1',
    amount: 52000,
    paymentMethod: 'ONLINE',
    transactionStatus: 'PENDING',
    paidByName: 'Mr. Okonkwo',
    paidByEmail: 'okonkwo@email.com',
    paidByPhone: '08056789012',
    transactionDate: '2025-12-15T16:45:00Z',
    transactionRef: 'ONL789012',
  },
];

const mockFeeStructures: FeeStructure[] = [
  { id: 'fs1', name: 'First Term Tuition', amount: 50000, dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, isActive: true, createdAt: '2025-08-01', description: 'Tuition fee for first term' },
  { id: 'fs2', name: 'Second Term Tuition', amount: 50000, dueDate: '2026-01-15', academicYear: '2025/2026', term: 2, isActive: true, createdAt: '2025-08-01', description: 'Tuition fee for second term' },
  { id: 'fs3', name: 'Third Term Tuition', amount: 50000, dueDate: '2026-04-15', academicYear: '2025/2026', term: 3, isActive: true, createdAt: '2025-08-01', description: 'Tuition fee for third term' },
  { id: 'fs4', name: 'Development Levy', amount: 15000, dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, isActive: true, createdAt: '2025-08-01', description: 'Annual development levy' },
  { id: 'fs5', name: 'WAEC Registration', amount: 35000, dueDate: '2026-02-28', academicYear: '2025/2026', term: 2, isActive: true, createdAt: '2025-08-01', description: 'WAEC exam registration fee' },
];

const mockInvoices: Invoice[] = [
  { id: 'inv1', studentName: 'Chukwuemeka Okafor', studentClass: 'Primary 5', admissionNumber: 'GA/2020/001', amount: 135000, paidAmount: 85000, status: 'PARTIAL', dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, feeName: 'First Term Fees' },
  { id: 'inv2', studentName: 'Adaeze Nwosu', studentClass: 'Primary 5', admissionNumber: 'GA/2020/002', amount: 135000, paidAmount: 135000, status: 'PAID', dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, feeName: 'First Term Fees' },
  { id: 'inv3', studentName: 'Oluwaseun Adebayo', studentClass: 'JSS 2', admissionNumber: 'GA/2021/015', amount: 155000, paidAmount: 155000, status: 'PAID', dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, feeName: 'First Term Fees' },
  { id: 'inv4', studentName: 'Fatima Ibrahim', studentClass: 'SS 3', admissionNumber: 'GA/2019/008', amount: 220000, paidAmount: 160000, status: 'PARTIAL', dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, feeName: 'First Term Fees' },
  { id: 'inv5', studentName: 'Emmanuel Chidi', studentClass: 'Primary 3', admissionNumber: 'GA/2022/045', amount: 125000, paidAmount: 0, status: 'OVERDUE', dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, feeName: 'First Term Fees' },
  { id: 'inv6', studentName: 'Blessing Okonkwo', studentClass: 'JSS 1', admissionNumber: 'GA/2023/012', amount: 145000, paidAmount: 0, status: 'PENDING', dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, feeName: 'First Term Fees' },
];

const mockBankAccounts: BankAccount[] = [
  { id: 'ba1', accountName: 'Greenfield Academy', accountNumber: '1234567890', bankName: 'First Bank of Nigeria', bankCode: 'FBN', accountType: 'current', isDefault: true, isActive: true },
  { id: 'ba2', accountName: 'Greenfield Academy', accountNumber: '0987654321', bankName: 'Guaranty Trust Bank', bankCode: 'GTB', accountType: 'savings', isDefault: false, isActive: true },
];

const mockStats: AdminStats = {
  totalRevenue: 3250000,
  totalExpected: 4500000,
  collectionRate: 72,
  pendingPayments: 18,
  overduePayments: 7,
  verifiedToday: 5,
  totalStudents: 245,
  paidStudents: 198,
};

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

const NIGERIAN_BANKS = [
  { code: 'FBN', name: 'First Bank of Nigeria' },
  { code: 'GTB', name: 'Guaranty Trust Bank' },
  { code: 'UBA', name: 'United Bank for Africa' },
  { code: 'ZENITH', name: 'Zenith Bank' },
  { code: 'ACCESS', name: 'Access Bank' },
  { code: 'ECOBANK', name: 'Ecobank' },
  { code: 'FCMB', name: 'First City Monument Bank' },
  { code: 'FIDELITY', name: 'Fidelity Bank' },
  { code: 'POLARIS', name: 'Polaris Bank' },
  { code: 'WEMA', name: 'Wema Bank' },
  { code: 'UNION', name: 'Union Bank' },
  { code: 'STANBIC', name: 'Stanbic IBTC Bank' },
];

export default function AdminFeesClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'invoices' | 'fee-structures' | 'bank-accounts'>('overview');
  
  // Transaction filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState('today');
  
  // Invoice filters
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
  
  // Modals
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter transactions
  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch = 
      transaction.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.paidByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transactionRef?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.transactionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter invoices
  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch = 
      invoice.studentName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      invoice.admissionNumber.toLowerCase().includes(invoiceSearch.toLowerCase());
    
    const matchesStatus = invoiceStatusFilter === 'all' || invoice.status === invoiceStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'VERIFIED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'PAID':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'PARTIAL':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const handleReview = async () => {
    if (!selectedTransaction || !reviewAction) return;
    
    console.log('Reviewing payment:', {
      transactionId: selectedTransaction.id,
      action: reviewAction,
      notes: reviewNotes,
      rejectionReason: reviewAction === 'reject' ? rejectionReason : undefined,
    });
    
    setShowReviewModal(false);
    setSelectedTransaction(null);
    setReviewAction(null);
    setReviewNotes('');
    setRejectionReason('');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Wallet size={18} className="text-green-600" />
            </div>
            <span className="text-xs text-zinc-500">Total Revenue</span>
          </div>
          <p className="text-xl font-bold text-zinc-900">{formatAmount(mockStats.totalRevenue)}</p>
          <p className="text-xs text-green-600 mt-1">{mockStats.collectionRate}% collection rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt size={18} className="text-blue-600" />
            </div>
            <span className="text-xs text-zinc-500">Total Expected</span>
          </div>
          <p className="text-xl font-bold text-zinc-900">{formatAmount(mockStats.totalExpected)}</p>
          <p className="text-xs text-zinc-500 mt-1">From {mockStats.totalStudents} students</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock size={18} className="text-amber-600" />
            </div>
            <span className="text-xs text-zinc-500">Pending</span>
          </div>
          <p className="text-xl font-bold text-amber-600">{mockStats.pendingPayments}</p>
          <p className="text-xs text-zinc-500 mt-1">Awaiting verification</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <span className="text-xs text-zinc-500">Overdue</span>
          </div>
          <p className="text-xl font-bold text-red-600">{mockStats.overduePayments}</p>
          <p className="text-xs text-zinc-500 mt-1">Require follow-up</p>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
            <h3 className="font-bold text-zinc-900">Recent Transactions</h3>
            <button 
              onClick={() => setActiveTab('transactions')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Student</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {mockTransactions.slice(0, 5).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm text-zinc-900">{transaction.studentName}</p>
                      <p className="text-xs text-zinc-500">{transaction.studentClass}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-sm text-zinc-900">{formatAmount(transaction.amount)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(transaction.transactionStatus)}`}>
                        {transaction.transactionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-zinc-600">
                      {format(new Date(transaction.transactionDate), 'MMM d, HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <h3 className="font-bold text-zinc-900 mb-4">Payment Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-600">Paid Students</span>
                <span className="font-medium">{mockStats.paidStudents}/{mockStats.totalStudents}</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(mockStats.paidStudents / mockStats.totalStudents) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-600">Collection Rate</span>
                <span className="font-medium">{mockStats.collectionRate}%</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${mockStats.collectionRate}%` }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600">Verified Today</span>
                <span className="text-lg font-bold text-green-600">{mockStats.verifiedToday}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by student name, parent, or transaction ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-zinc-200 rounded-lg text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="VERIFIED">Verified</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-zinc-200 rounded-lg text-sm bg-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="term">This Term</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-sm font-medium">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Student</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Method</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Ref</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Reviewed By</th>
                <th className="text-center py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    <Wallet size={40} className="mx-auto mb-3 text-zinc-300" />
                    <p>No transactions found</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm text-zinc-900">{transaction.studentName}</p>
                      <p className="text-xs text-zinc-500">{transaction.studentClass}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-sm text-zinc-900">{formatAmount(transaction.amount)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-zinc-600">{transaction.paymentMethod.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(transaction.transactionStatus)}`}>
                        {transaction.transactionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-zinc-600">
                      {format(new Date(transaction.transactionDate), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4 text-xs text-zinc-600">
                      {transaction.transactionRef || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {transaction.reviewedByName ? (
                        <div>
                          <p className="text-xs font-medium text-zinc-900">{transaction.reviewedByName}</p>
                          {transaction.reviewedAt && (
                            <p className="text-[10px] text-zinc-500">
                              {format(new Date(transaction.reviewedAt), 'MMM d, HH:mm')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {transaction.transactionStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setReviewAction('approve');
                                setShowReviewModal(true);
                              }}
                              className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setReviewAction('reject');
                                setShowReviewModal(true);
                              }}
                              className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowTransactionModal(true);
                          }}
                          className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by student name or admission number..."
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={invoiceStatusFilter}
            onChange={(e) => setInvoiceStatusFilter(e.target.value)}
            className="px-4 py-2 border border-zinc-200 rounded-lg text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus size={16} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Student</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Paid</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Balance</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Due Date</th>
                <th className="text-center py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm text-zinc-900">{invoice.studentName}</p>
                    <p className="text-xs text-zinc-500">{invoice.studentClass} • {invoice.admissionNumber}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm text-zinc-900">{formatAmount(invoice.amount)}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm text-green-600">{formatAmount(invoice.paidAmount)}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm text-zinc-900">{formatAmount(invoice.amount - invoice.paidAmount)}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-zinc-600">
                    {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFeeStructures = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-zinc-900">Fee Structures</h3>
        <button 
          onClick={() => setShowAddFeeModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus size={16} />
          Add Fee Structure
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Fee Name</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Due Date</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Term</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Academic Year</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Status</th>
                <th className="text-center py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {mockFeeStructures.map((fee) => (
                <tr key={fee.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm text-zinc-900">{fee.name}</p>
                    {fee.description && <p className="text-xs text-zinc-500">{fee.description}</p>}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-sm text-zinc-900">{formatAmount(fee.amount)}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-600">
                    {format(new Date(fee.dueDate), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-600">
                    Term {fee.term}
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-600">
                    {fee.academicYear}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                      fee.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}>
                      {fee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                        <Edit3 size={14} />
                      </button>
                      <button className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBankAccounts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-zinc-900">Bank Accounts</h3>
        <button 
          onClick={() => setShowAddBankModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus size={16} />
          Add Bank Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockBankAccounts.map((account) => (
          <div key={account.id} className={`bg-white p-4 rounded-xl border shadow-sm ${account.isDefault ? 'border-blue-300 ring-1 ring-blue-200' : 'border-zinc-200'}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                <div>
                  <p className="font-bold text-zinc-900">{account.bankName}</p>
                  {account.isDefault && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200">
                  <Edit3 size={14} />
                </button>
                <button className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Account Name</span>
                <span className="font-medium">{account.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Account Number</span>
                <span className="font-medium">{account.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Account Type</span>
                <span className="font-medium capitalize">{account.accountType}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">Fees Management</h1>
          <p className="text-zinc-500 mt-1 text-xs sm:text-sm">Manage school fees, payments, and financial records</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-sm font-medium">
            <Download size={18} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'transactions', label: 'Transactions', icon: History },
            { id: 'invoices', label: 'Invoices', icon: Receipt },
            { id: 'fee-structures', label: 'Fee Structures', icon: FileText },
            { id: 'bank-accounts', label: 'Bank Accounts', icon: Building2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'transactions' && renderTransactions()}
      {activeTab === 'invoices' && renderInvoices()}
      {activeTab === 'fee-structures' && renderFeeStructures()}
      {activeTab === 'bank-accounts' && renderBankAccounts()}

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-900">Transaction Details</h3>
              <button 
                onClick={() => setShowTransactionModal(false)}
                className="p-2 hover:bg-zinc-100 rounded-lg"
              >
                <X size={20} className="text-zinc-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                  {selectedTransaction.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{selectedTransaction.studentName}</p>
                  <p className="text-sm text-zinc-500">{selectedTransaction.studentClass}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-50 rounded-lg">
                  <p className="text-xs text-zinc-500">Amount</p>
                  <p className="font-bold text-lg">{formatAmount(selectedTransaction.amount)}</p>
                </div>
                <div className="p-3 bg-zinc-50 rounded-lg">
                  <p className="text-xs text-zinc-500">Status</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedTransaction.transactionStatus)}`}>
                    {selectedTransaction.transactionStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Payment Method</span>
                  <span className="text-sm font-medium">{selectedTransaction.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Transaction Ref</span>
                  <span className="text-sm font-medium">{selectedTransaction.transactionRef || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Date</span>
                  <span className="text-sm font-medium">{format(new Date(selectedTransaction.transactionDate), 'MMM d, yyyy HH:mm')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Paid By</span>
                  <span className="text-sm font-medium">{selectedTransaction.paidByName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Email</span>
                  <span className="text-sm font-medium">{selectedTransaction.paidByEmail}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Phone</span>
                  <span className="text-sm font-medium">{selectedTransaction.paidByPhone}</span>
                </div>
              </div>

              {selectedTransaction.reviewedByName && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Reviewed By</p>
                  <p className="text-sm font-medium text-blue-900">{selectedTransaction.reviewedByName}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {selectedTransaction.reviewedAt && format(new Date(selectedTransaction.reviewedAt), 'MMM d, yyyy HH:mm')}
                  </p>
                  {selectedTransaction.reviewNotes && (
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <p className="text-xs text-blue-600">Review Notes</p>
                      <p className="text-sm text-blue-800">{selectedTransaction.reviewNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedTransaction.rejectionReason && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 mb-1">Rejection Reason</p>
                  <p className="text-sm font-medium text-red-900">{selectedTransaction.rejectionReason}</p>
                </div>
              )}

              {selectedTransaction.notes && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-600 mb-1">Notes</p>
                  <p className="text-sm text-amber-900">{selectedTransaction.notes}</p>
                </div>
              )}

              {selectedTransaction.proofOfPaymentUrl && (
                <div>
                  <p className="text-sm text-zinc-600 mb-2">Proof of Payment</p>
                  <div className="p-3 bg-zinc-50 rounded-lg border-2 border-dashed border-zinc-300">
                    <a 
                      href={selectedTransaction.proofOfPaymentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <FileText size={20} />
                      <span className="text-sm font-medium">View Receipt</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-900">
                {reviewAction === 'approve' ? 'Approve Payment' : 'Reject Payment'}
              </h3>
              <button 
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedTransaction(null);
                  setReviewAction(null);
                  setReviewNotes('');
                  setRejectionReason('');
                }}
                className="p-2 hover:bg-zinc-100 rounded-lg"
              >
                <X size={20} className="text-zinc-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-zinc-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600">Student:</span>
                  <span className="font-medium text-sm">{selectedTransaction.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600">Amount:</span>
                  <span className="font-bold text-sm">{formatAmount(selectedTransaction.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600">Paid By:</span>
                  <span className="text-sm">{selectedTransaction.paidByName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600">Method:</span>
                  <span className="text-sm">{selectedTransaction.paymentMethod.replace('_', ' ')}</span>
                </div>
                {selectedTransaction.transactionRef && (
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-600">Reference:</span>
                    <span className="text-sm">{selectedTransaction.transactionRef}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this payment..."
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    rows={3}
                  />
                </div>

                {reviewAction === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select reason...</option>
                      <option value="Insufficient amount">Insufficient amount</option>
                      <option value="Wrong account">Wrong account</option>
                      <option value="Duplicate payment">Duplicate payment</option>
                      <option value="Invalid proof">Invalid proof of payment</option>
                      <option value="Transaction not found">Transaction not found in bank</option>
                      <option value="Other">Other</option>
                    </select>
                    {rejectionReason === 'Other' && (
                      <textarea
                        placeholder="Specify other reason..."
                        className="w-full mt-2 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        rows={2}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 flex gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedTransaction(null);
                  setReviewAction(null);
                }}
                className="flex-1 py-2.5 bg-zinc-100 text-zinc-600 rounded-lg font-medium hover:bg-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={reviewAction === 'reject' && !rejectionReason}
                className={`flex-1 py-2.5 rounded-lg font-medium ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {reviewAction === 'approve' ? 'Approve Payment' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Fee Modal */}
      {showAddFeeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Add Fee Structure</h3>
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
                    <option value="1">Term 1</option>
                    <option value="2">Term 2</option>
                    <option value="3">Term 3</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Academic Year</label>
                <input type="text" placeholder="2025/2026" className="w-full px-4 py-3 border border-zinc-200 rounded-xl" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddFeeModal(false)} className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">Create Fee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bank Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Add Bank Account</h3>
              <button onClick={() => setShowAddBankModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Bank Name</label>
                <select className="w-full px-4 py-3 border border-zinc-200 rounded-xl">
                  <option>Select Bank</option>
                  {NIGERIAN_BANKS.map(bank => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Account Number</label>
                <input type="text" placeholder="1234567890" maxLength={10} className="w-full px-4 py-3 border border-zinc-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Account Name</label>
                <input type="text" placeholder="School Name" className="w-full px-4 py-3 border border-zinc-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Account Type</label>
                <select className="w-full px-4 py-3 border border-zinc-200 rounded-xl">
                  <option value="current">Current</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isDefault" className="rounded border-zinc-300" />
                <label htmlFor="isDefault" className="text-sm text-zinc-600">Set as default account</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddBankModal(false)} className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">Add Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
