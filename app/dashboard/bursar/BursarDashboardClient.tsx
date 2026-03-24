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
  Building2
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

interface BursarStats {
  totalRevenue: number;
  pendingPayments: number;
  verifiedPayments: number;
  rejectedPayments: number;
  todayRevenue: number;
  outstandingBalance: number;
}

// Mock data
const mockPayments: PaymentTransaction[] = [
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
    reviewedByName: 'Mr. Adeyemi',
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
    reviewedByName: 'Mr. Adeyemi',
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
    reviewedByName: 'Mr. Adeyemi',
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
    transactionStatus: 'PROCESSING',
    paidByName: 'Mrs. Chidi',
    paidByEmail: 'chidi@email.com',
    paidByPhone: '08045678901',
    transactionDate: '2025-12-15T08:15:00Z',
    transactionRef: 'POS567890',
  },
];

const mockStats: BursarStats = {
  totalRevenue: 2500000,
  pendingPayments: 12,
  verifiedPayments: 145,
  rejectedPayments: 3,
  todayRevenue: 150000,
  outstandingBalance: 850000,
};

// Bank account details for display
const mockBankAccount = {
  accountName: 'Greenfield Academy',
  accountNumber: '1234567890',
  bankName: 'First Bank of Nigeria',
  bankCode: 'FBN',
};

export default function BursarDashboardClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [dateRange, setDateRange] = useState('today');

  // Filter payments
  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paidByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionRef?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.transactionStatus === statusFilter;
    
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
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['ID', 'Student', 'Class', 'Amount', 'Method', 'Status', 'Date', 'Reference', 'Paid By'].join(',');
    const rows = filteredPayments.map(p => [
      p.id,
      p.studentName,
      p.studentClass,
      p.amount,
      p.paymentMethod,
      p.transactionStatus,
      format(new Date(p.transactionDate), 'yyyy-MM-dd HH:mm'),
      p.transactionRef || '',
      p.paidByName
    ].join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleReview = async () => {
    if (!selectedPayment || !reviewAction) return;
    
    // Update payment status locally (in production, call API)
    const updatedPayments = mockPayments.map(p => {
      if (p.id === selectedPayment.id) {
        return {
          ...p,
          transactionStatus: reviewAction === 'approve' ? 'VERIFIED' : 'REJECTED',
          reviewedByName: 'Current User',
          reviewedAt: new Date().toISOString(),
          reviewNotes: reviewNotes || undefined,
          rejectionReason: reviewAction === 'reject' ? rejectionReason : undefined,
        };
      }
      return p;
    });
    
    // Reset and close
    setShowReviewModal(false);
    setSelectedPayment(null);
    setReviewAction(null);
    setReviewNotes('');
    setRejectionReason('');
    
    // Show success message (in production, update state properly)
    alert(`Payment ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully!`);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900">Bursar Dashboard</h1>
          <p className="text-zinc-500 mt-1 text-xs sm:text-sm">Manage school fees and payments</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => router.push('/dashboard/admin/fees?tab=bank-accounts')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Building2 size={18} />
            <span>Bank Accounts</span>
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-sm font-medium"
          >
            <Download size={18} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Wallet size={14} className="text-green-600" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Total Revenue</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-zinc-900">{formatAmount(mockStats.totalRevenue)}</p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <TrendingUp size={14} className="text-blue-600" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Today</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-blue-600">{formatAmount(mockStats.todayRevenue)}</p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <Clock size={14} className="text-amber-600" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Pending</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-amber-600">{mockStats.pendingPayments}</p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <CheckCircle2 size={14} className="text-purple-600" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Verified</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-purple-600">{mockStats.verifiedPayments}</p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <XCircle size={14} className="text-red-600" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Rejected</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-red-600">{mockStats.rejectedPayments}</p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-orange-100 rounded-lg">
              <AlertCircle size={14} className="text-orange-600" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500">Outstanding</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-orange-600">{formatAmount(mockStats.outstandingBalance)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by student name, parent, or transaction ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-200 rounded-lg text-xs sm:text-sm bg-white"
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
            className="px-3 py-2 border border-zinc-200 rounded-lg text-xs sm:text-sm bg-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="term">This Term</option>
          </select>
        </div>
      </div>

      {/* Bank Account Info */}
      <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Building2 size={16} className="text-blue-600" />
          <h3 className="font-bold text-blue-900 text-sm">School Bank Account Details</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-blue-600">Account Name</p>
            <p className="font-medium text-blue-900">{mockBankAccount.accountName}</p>
          </div>
          <div>
            <p className="text-xs text-blue-600">Account Number</p>
            <p className="font-medium text-blue-900">{mockBankAccount.accountNumber}</p>
          </div>
          <div>
            <p className="text-xs text-blue-600">Bank</p>
            <p className="font-medium text-blue-900">{mockBankAccount.bankName}</p>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-zinc-200">
          <h2 className="font-bold text-zinc-900 text-sm sm:text-base">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase">Student</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase">Amount</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase">Method</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase">Status</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase">Date</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase">Ref</th>
                <th className="text-center py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 sm:py-12 text-center text-zinc-500">
                    <Wallet size={32} className="mx-auto mb-3 text-zinc-300" />
                    <p className="text-xs sm:text-sm">No payments found</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-zinc-50">
                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                      <div>
                        <p className="font-medium text-zinc-900 text-xs sm:text-sm">{payment.studentName}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-500">{payment.studentClass}</p>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                      <p className="font-bold text-zinc-900 text-xs sm:text-sm">{formatAmount(payment.amount)}</p>
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                      <span className="text-xs text-zinc-600">
                        {payment.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(payment.transactionStatus)}`}>
                        {payment.transactionStatus}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs text-zinc-600">
                      {format(new Date(payment.transactionDate), 'MMM d, HH:mm')}
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs text-zinc-600">
                      {payment.transactionRef || '-'}
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                      <div className="flex items-center justify-center gap-1">
                        {payment.transactionStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
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
                                setSelectedPayment(payment);
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
                          onClick={() => setSelectedPayment(payment)}
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

      {/* Review Modal */}
      {showReviewModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-900">
                {reviewAction === 'approve' ? 'Approve Payment' : 'Reject Payment'}
              </h3>
              <button 
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedPayment(null);
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
              {/* Payment Details */}
              <div className="bg-zinc-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600">Student:</span>
                  <span className="font-medium text-sm">{selectedPayment.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600">Amount:</span>
                  <span className="font-bold text-sm">{formatAmount(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600">Paid By:</span>
                  <span className="text-sm">{selectedPayment.paidByName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600">Method:</span>
                  <span className="text-sm">{selectedPayment.paymentMethod.replace('_', ' ')}</span>
                </div>
                {selectedPayment.transactionRef && (
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-600">Reference:</span>
                    <span className="text-sm">{selectedPayment.transactionRef}</span>
                  </div>
                )}
              </div>

              {/* Review Form */}
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
                  setSelectedPayment(null);
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

      {/* Payment Details Modal */}
      {selectedPayment && !showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-900">Payment Details</h3>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="p-2 hover:bg-zinc-100 rounded-lg"
              >
                <X size={20} className="text-zinc-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                  {selectedPayment.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{selectedPayment.studentName}</p>
                  <p className="text-sm text-zinc-500">{selectedPayment.studentClass}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-50 rounded-lg">
                  <p className="text-xs text-zinc-500">Amount</p>
                  <p className="font-bold text-lg">{formatAmount(selectedPayment.amount)}</p>
                </div>
                <div className="p-3 bg-zinc-50 rounded-lg">
                  <p className="text-xs text-zinc-500">Status</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedPayment.transactionStatus)}`}>
                    {selectedPayment.transactionStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Payment Method</span>
                  <span className="text-sm font-medium">{selectedPayment.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Transaction Ref</span>
                  <span className="text-sm font-medium">{selectedPayment.transactionRef || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Date</span>
                  <span className="text-sm font-medium">{format(new Date(selectedPayment.transactionDate), 'MMM d, yyyy HH:mm')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Paid By</span>
                  <span className="text-sm font-medium">{selectedPayment.paidByName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Email</span>
                  <span className="text-sm font-medium">{selectedPayment.paidByEmail}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Phone</span>
                  <span className="text-sm font-medium">{selectedPayment.paidByPhone}</span>
                </div>
              </div>

              {selectedPayment.reviewedByName && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Reviewed By</p>
                  <p className="text-sm font-medium text-blue-900">{selectedPayment.reviewedByName}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {selectedPayment.reviewedAt && format(new Date(selectedPayment.reviewedAt), 'MMM d, yyyy HH:mm')}
                  </p>
                  {selectedPayment.reviewNotes && (
                    <p className="text-sm text-blue-800 mt-2">{selectedPayment.reviewNotes}</p>
                  )}
                </div>
              )}

              {selectedPayment.rejectionReason && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 mb-1">Rejection Reason</p>
                  <p className="text-sm font-medium text-red-900">{selectedPayment.rejectionReason}</p>
                </div>
              )}

              {selectedPayment.notes && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-600 mb-1">Notes</p>
                  <p className="text-sm text-amber-900">{selectedPayment.notes}</p>
                </div>
              )}

              {selectedPayment.proofOfPaymentUrl && (
                <div>
                  <p className="text-sm text-zinc-600 mb-2">Proof of Payment</p>
                  <div className="p-3 bg-zinc-50 rounded-lg border-2 border-dashed border-zinc-300">
                    <a 
                      href={selectedPayment.proofOfPaymentUrl} 
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
    </div>
  );
}
