'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet,
  CreditCard,
  Building2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  Baby,
  FileText,
  X,
  ChevronRight,
  Banknote,
  Receipt,
  Smartphone
} from 'lucide-react';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useRBAC } from '@/hooks/use-rbac';

interface Child {
  id: string;
  name: string;
  class: string;
  admissionNo: string;
  outstandingFees: number;
  paidAmount: number;
}

interface FeeItem {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  paidAmount: number;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

interface PaymentSubmission {
  amount: number;
  transactionRef: string;
  paymentMethod: 'BANK_TRANSFER' | 'POS' | 'CASH' | 'ONLINE';
  notes: string;
  proofOfPayment?: File;
}

// Mock data - replace with API calls
const mockChildren: Child[] = [
  { 
    id: '1', 
    name: 'Chukwuemeka Okafor', 
    class: 'Primary 5', 
    admissionNo: 'GA/2023/001',
    outstandingFees: 45000,
    paidAmount: 90000
  },
];

const mockFees: FeeItem[] = [
  { id: '1', name: 'Second Term Tuition', amount: 85000, dueDate: '2026-01-15', status: 'PARTIAL', paidAmount: 40000 },
  { id: '2', name: 'Laboratory Fee', amount: 10000, dueDate: '2025-09-15', status: 'OVERDUE', paidAmount: 0 },
];

const mockBankAccounts: BankAccount[] = [
  { id: '1', bankName: 'First Bank of Nigeria', accountNumber: '1234567890', accountName: 'Greenfield Academy', isDefault: true },
  { id: '2', bankName: 'Guaranty Trust Bank', accountNumber: '0987654321', accountName: 'Greenfield Academy', isDefault: false },
];

const mockPaymentHistory = [
  { id: '1', date: '2025-09-10', amount: 85000, method: 'BANK_TRANSFER', status: 'VERIFIED', description: 'First Term Tuition' },
  { id: '2', date: '2025-09-10', amount: 15000, method: 'BANK_TRANSFER', status: 'VERIFIED', description: 'Development Levy' },
  { id: '3', date: '2026-01-05', amount: 40000, method: 'POS', status: 'VERIFIED', description: 'Second Term Tuition (Partial)' },
];

function ParentFeesContent() {
  const { data: session } = useSession();
  const { role } = useRBAC();
  const [selectedChild, setSelectedChild] = useState<Child>(mockChildren[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'pay' | 'history'>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeItem | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentSubmission>({
    amount: 0,
    transactionRef: '',
    paymentMethod: 'BANK_TRANSFER',
    notes: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const totalOutstanding = mockFees.reduce((sum, fee) => sum + (fee.amount - fee.paidAmount), 0);
  const totalPaid = mockFees.reduce((sum, fee) => sum + fee.paidAmount, 0);
  const totalExpected = mockFees.reduce((sum, fee) => sum + fee.amount, 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowPaymentModal(false);
      setPaymentForm({
        amount: 0,
        transactionRef: '',
        paymentMethod: 'BANK_TRANSFER',
        notes: '',
      });
      setUploadedFile(null);
    }, 3000);
  };

  const openPaymentModal = (fee?: FeeItem) => {
    if (fee) {
      setSelectedFee(fee);
      setPaymentForm(prev => ({
        ...prev,
        amount: fee.amount - fee.paidAmount,
      }));
    } else {
      setSelectedFee(null);
      setPaymentForm({
        amount: 0,
        transactionRef: '',
        paymentMethod: 'BANK_TRANSFER',
        notes: '',
      });
    }
    setShowPaymentModal(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Pay School Fees</h1>
        <p className="text-zinc-500 mt-1">View outstanding fees and make payments for your children</p>
      </div>

      {/* Child Selector */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Select Child</label>
        <div className="flex flex-wrap gap-2">
          {mockChildren.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedChild.id === child.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <Baby size={16} />
              {child.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <span className="text-sm text-zinc-500">Outstanding Balance</span>
          </div>
          <p className="text-2xl font-bold text-red-600">₦{totalOutstanding.toLocaleString()}</p>
          <p className="text-xs text-zinc-400 mt-1">{mockFees.filter(f => f.status !== 'PAID').length} pending payments</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <span className="text-sm text-zinc-500">Total Paid</span>
          </div>
          <p className="text-2xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-zinc-400 mt-1">This academic year</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet size={20} className="text-blue-600" />
            </div>
            <span className="text-sm text-zinc-500">Total Expected</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">₦{totalExpected.toLocaleString()}</p>
          <p className="text-xs text-zinc-400 mt-1">For all fees</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <FileText size={18} />
              Outstanding Fees
            </button>
            <button
              onClick={() => setActiveTab('pay')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pay'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <CreditCard size={18} />
              Make Payment
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <History size={18} />
              Payment History
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Outstanding Fees Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Outstanding Fees Table */}
              <div>
                <h3 className="font-bold text-zinc-900 mb-4">Outstanding Fees for {selectedChild.name}</h3>
                {mockFees.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    <CheckCircle2 size={48} className="mx-auto mb-3 text-green-500" />
                    <p>No outstanding fees. All payments are up to date!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-zinc-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Fee Name</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Amount</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Paid</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Balance</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Due Date</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Status</th>
                          <th className="text-center py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {mockFees.map((fee) => (
                          <tr key={fee.id} className="hover:bg-zinc-50">
                            <td className="py-4 px-4">
                              <p className="font-medium text-zinc-900">{fee.name}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium text-zinc-900">₦{fee.amount.toLocaleString()}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-green-600">₦{fee.paidAmount.toLocaleString()}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-bold text-red-600">₦{(fee.amount - fee.paidAmount).toLocaleString()}</p>
                            </td>
                            <td className="py-4 px-4 text-sm text-zinc-600">
                              {format(new Date(fee.dueDate), 'MMM d, yyyy')}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                                fee.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                fee.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                                fee.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {fee.status === 'PAID' && <CheckCircle2 size={12} />}
                                {fee.status === 'PARTIAL' && <Clock size={12} />}
                                {fee.status === 'OVERDUE' && <AlertCircle size={12} />}
                                {fee.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {fee.status !== 'PAID' && (
                                <button
                                  onClick={() => openPaymentModal(fee)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                                >
                                  <CreditCard size={14} />
                                  Pay Now
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pay All Button */}
              {totalOutstanding > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => openPaymentModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800"
                  >
                    <Wallet size={20} />
                    Pay All Outstanding Fees (₦{totalOutstanding.toLocaleString()})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Make Payment Tab */}
          {activeTab === 'pay' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Building2 size={20} />
                  School Bank Account Details
                </h3>
                <p className="text-sm text-blue-700 mb-4">Please transfer the payment to one of the following accounts:</p>
                
                <div className="space-y-3">
                  {mockBankAccounts.map((account) => (
                    <div key={account.id} className={`p-4 bg-white rounded-lg border ${account.isDefault ? 'border-blue-300 ring-1 ring-blue-200' : 'border-zinc-200'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-zinc-900">{account.bankName}</p>
                          <p className="text-sm text-zinc-600">Account Name: {account.accountName}</p>
                          <p className="text-lg font-bold text-zinc-900 mt-1">{account.accountNumber}</p>
                        </div>
                        {account.isDefault && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Important Payment Instructions
                </h4>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>Use your child&apos;s Admission Number as payment reference/description</li>
                  <li>Keep your payment receipt or screenshot as proof</li>
                  <li>Submit the payment details using the form below</li>
                  <li>The Bursar will verify your payment within 24-48 hours</li>
                  <li>For enquiries, contact the Bursar&apos;s office</li>
                </ul>
              </div>

              <button
                onClick={() => openPaymentModal()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
              >
                <CreditCard size={20} />
                Submit Payment Details
              </button>
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 className="font-bold text-zinc-900 mb-4">Payment History for {selectedChild.name}</h3>
              {mockPaymentHistory.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <History size={48} className="mx-auto mb-3 text-zinc-300" />
                  <p>No payment history found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockPaymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          payment.status === 'VERIFIED' ? 'bg-green-100' : 'bg-amber-100'
                        }`}>
                          {payment.method === 'BANK_TRANSFER' && <Building2 size={20} className={payment.status === 'VERIFIED' ? 'text-green-600' : 'text-amber-600'} />}
                          {payment.method === 'POS' && <CreditCard size={20} className={payment.status === 'VERIFIED' ? 'text-green-600' : 'text-amber-600'} />}
                          {payment.method === 'CASH' && <Banknote size={20} className={payment.status === 'VERIFIED' ? 'text-green-600' : 'text-amber-600'} />}
                          {payment.method === 'ONLINE' && <Smartphone size={20} className={payment.status === 'VERIFIED' ? 'text-green-600' : 'text-amber-600'} />}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{payment.description}</p>
                          <p className="text-sm text-zinc-500">{format(new Date(payment.date), 'MMM d, yyyy')} • {payment.method.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-zinc-900">₦{payment.amount.toLocaleString()}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          payment.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {payment.status === 'VERIFIED' && <CheckCircle2 size={10} />}
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Submit Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-zinc-900 mb-2">Payment Submitted!</h4>
                <p className="text-zinc-600">Your payment details have been submitted successfully. The Bursar will verify and approve your payment within 24-48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
                {selectedFee && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Paying for:</p>
                    <p className="font-bold text-blue-900">{selectedFee.name}</p>
                    <p className="text-sm text-blue-700">Outstanding: ₦{(selectedFee.amount - selectedFee.paidAmount).toLocaleString()}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Amount Paid (₦) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={paymentForm.amount || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Payment Method *</label>
                  <select
                    required
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="POS">POS Terminal</option>
                    <option value="CASH">Cash Deposit</option>
                    <option value="ONLINE">Online Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Transaction Reference / ID *</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.transactionRef}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g., TRX123456789"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Enter the transaction reference from your bank receipt</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Proof of Payment *</label>
                  <div className="border-2 border-dashed border-zinc-300 rounded-lg p-4 text-center">
                    {uploadedFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Receipt size={20} className="text-blue-600" />
                          <span className="text-sm text-zinc-700">{uploadedFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedFile(null)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="mx-auto mb-2 text-zinc-400" />
                        <p className="text-sm text-zinc-600 mb-2">Upload receipt or screenshot</p>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="payment-proof"
                        />
                        <label
                          htmlFor="payment-proof"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 cursor-pointer"
                        >
                          Choose File
                        </label>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Accepted: JPG, PNG, PDF (Max 5MB)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Additional Notes</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-100"
                    rows={3}
                    placeholder="Any additional information about the payment..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !uploadedFile || !paymentForm.transactionRef || paymentForm.amount <= 0}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Payment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Export wrapped with RoleGuard
export default function ParentFeesPage() {
  return (
    <RoleGuard 
      allowedRoles={['PARENT']}
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-100">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
            <ShieldAlert size={64} className="mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h1>
            <p className="text-zinc-600">This page is only accessible to parents.</p>
          </div>
        </div>
      }
    >
      <ParentFeesContent />
    </RoleGuard>
  );
}

import { RoleGuard } from '@/components/RoleGuard';
import { ShieldAlert } from 'lucide-react';
