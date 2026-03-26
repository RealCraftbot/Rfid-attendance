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
  amount: number;
  paymentMethod: string;
  transactionStatus: string;
  proofOfPaymentUrl: string | null;
  paidByName: string | null;
  paidByEmail: string | null;
  paidByPhone: string | null;
  transactionDate: string;
  transactionRef: string | null;
  notes: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  invoice: {
    id: string;
    student: {
      id: string;
      name: string;
      admissionNumber: string | null;
    };
  };
}

interface BursarStats {
  totalRevenue: number;
  pendingPayments: number;
  verifiedPayments: number;
  rejectedPayments: number;
  todayRevenue: number;
  outstandingBalance: number;
}

export default function BursarDashboardClient() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Fetch pending payments on load
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async (status = 'PENDING') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments/approve?status=${status}`);
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const studentName = payment.invoice?.student?.name || '';
    const matchesSearch = 
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.paidByName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.transactionRef || '').toLowerCase().includes(searchQuery.toLowerCase());
    
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

  const handleReview = async () => {
    if (!selectedPayment || !reviewAction) return;
    
    setProcessingAction(true);
    
    try {
      const response = await fetch('/api/payments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action: reviewAction,
          notes: reviewNotes,
          rejectionReason: reviewAction === 'reject' ? rejectionReason : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh payments list
        await fetchPayments();
        
        // Reset and close
        setShowReviewModal(false);
        setSelectedPayment(null);
        setReviewAction(null);
        setReviewNotes('');
        setRejectionReason('');
        
        alert(`Payment ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully!`);
      } else {
        alert(data.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Review error:', error);
      alert('Failed to process payment review');
    } finally {
      setProcessingAction(false);
    }
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
            onChange={(e) => {
              setStatusFilter(e.target.value);
              if (e.target.value !== 'all') {
                fetchPayments(e.target.value);
              }
            }}
            className="px-3 py-2 border border-zinc-200 rounded-lg text-xs sm:text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="VERIFIED">Verified</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-zinc-200">
          <h2 className="font-bold text-zinc-900 text-sm sm:text-base">
            {statusFilter === 'all' ? 'All Payments' : `${statusFilter} Payments`}
          </h2>
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 sm:py-12 text-center text-zinc-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-xs">Loading payments...</p>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
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
                        <p className="font-medium text-zinc-900 text-xs sm:text-sm">
                          {payment.invoice?.student?.name || 'Unknown Student'}
                        </p>
                        <p className="text-[10px] sm:text-xs text-zinc-500">
                          {payment.invoice?.student?.admissionNumber || '-'}
                        </p>
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
                  <span className="font-medium text-sm">{selectedPayment.invoice?.student?.name}</span>
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
                disabled={processingAction}
                className="flex-1 py-2.5 bg-zinc-100 text-zinc-600 rounded-lg font-medium hover:bg-zinc-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={processingAction || (reviewAction === 'reject' && !rejectionReason)}
                className={`flex-1 py-2.5 rounded-lg font-medium ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {processingAction 
                  ? 'Processing...' 
                  : reviewAction === 'approve' 
                    ? 'Approve Payment' 
                    : 'Reject Payment'
                }
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
                  {(selectedPayment.invoice?.student?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{selectedPayment.invoice?.student?.name || 'Unknown Student'}</p>
                  <p className="text-sm text-zinc-500">{selectedPayment.invoice?.student?.admissionNumber || '-'}</p>
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
