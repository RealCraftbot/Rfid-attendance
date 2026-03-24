'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  History,
  Printer,
  ArrowLeft
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
  items?: InvoiceItem[];
  createdAt?: string;
}

interface InvoiceItem {
  description: string;
  amount: number;
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
  { id: 'inv1', studentName: 'Chukwuemeka Okafor', studentClass: 'Primary 5', admissionNumber: 'GA/2020/001', amount: 135000, paidAmount: 85000, status: 'PARTIAL', dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, feeName: 'First Term Fees', createdAt: '2025-08-01', items: [
    { description: 'Tuition Fee', amount: 50000 },
    { description: 'Development Levy', amount: 15000 },
    { description: 'ICT Fee', amount: 20000 },
    { description: 'Sports Fee', amount: 5000 },
    { description: 'Books & Materials', amount: 45000 },
  ]},
  { id: 'inv2', studentName: 'Adaeze Nwosu', studentClass: 'Primary 5', admissionNumber: 'GA/2020/002', amount: 135000, paidAmount: 135000, status: 'PAID', dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, feeName: 'First Term Fees', createdAt: '2025-08-01' },
  { id: 'inv3', studentName: 'Oluwaseun Adebayo', studentClass: 'JSS 2', admissionNumber: 'GA/2021/015', amount: 155000, paidAmount: 155000, status: 'PAID', dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, feeName: 'First Term Fees', createdAt: '2025-08-01' },
  { id: 'inv4', studentName: 'Fatima Ibrahim', studentClass: 'SS 3', admissionNumber: 'GA/2019/008', amount: 220000, paidAmount: 160000, status: 'PARTIAL', dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, feeName: 'First Term Fees', createdAt: '2025-08-01' },
  { id: 'inv5', studentName: 'Emmanuel Chidi', studentClass: 'Primary 3', admissionNumber: 'GA/2022/045', amount: 125000, paidAmount: 0, status: 'OVERDUE', dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, feeName: 'First Term Fees', createdAt: '2025-08-01' },
  { id: 'inv6', studentName: 'Blessing Okonkwo', studentClass: 'JSS 1', admissionNumber: 'GA/2023/012', amount: 145000, paidAmount: 0, status: 'PENDING', dueDate: '2025-09-15', academicYear: '2025/2026', term: 1, feeName: 'First Term Fees', createdAt: '2025-08-01' },
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

// Available students for invoice creation
const availableStudents = [
  { id: 's1', name: 'Chukwuemeka Okafor', class: 'Primary 5', admissionNo: 'GA/2020/001' },
  { id: 's2', name: 'Adaeze Nwosu', class: 'Primary 5', admissionNo: 'GA/2020/002' },
  { id: 's3', name: 'Oluwaseun Adebayo', class: 'JSS 2', admissionNo: 'GA/2021/015' },
  { id: 's4', name: 'Fatima Ibrahim', class: 'SS 3', admissionNo: 'GA/2019/008' },
  { id: 's5', name: 'Emmanuel Chidi', class: 'Primary 3', admissionNo: 'GA/2022/045' },
  { id: 's6', name: 'Blessing Okonkwo', class: 'JSS 1', admissionNo: 'GA/2023/012' },
  { id: 's7', name: 'John Smith', class: 'Primary 1', admissionNo: 'GA/2024/001' },
  { id: 's8', name: 'Mary Johnson', class: 'Primary 2', admissionNo: 'GA/2023/089' },
];

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
  
  // Data states
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(mockTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(mockFeeStructures);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  
  // Transaction filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState('today');
  
  // Invoice filters
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
  
  // Modals
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<FeeStructure | null>(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPreviewInvoiceModal, setShowPreviewInvoiceModal] = useState(false);
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [showEditFeeModal, setShowEditFeeModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showEditBankModal, setShowEditBankModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{type: 'fee' | 'bank' | 'invoice', id: string} | null>(null);
  
  // Review states
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Form states for create invoice
  const [newInvoice, setNewInvoice] = useState({
    studentId: '',
    feeStructureId: '',
    items: [{ description: '', amount: 0 }],
    dueDate: '',
    academicYear: '2025/2026',
    term: 1,
  });
  
  // Form states for fee structure
  const [feeForm, setFeeForm] = useState({
    name: '',
    description: '',
    amount: 0,
    dueDate: '',
    academicYear: '2025/2026',
    term: 1,
    isActive: true,
  });
  
  // Form states for bank account
  const [bankForm, setBankForm] = useState({
    bankCode: '',
    accountNumber: '',
    accountName: '',
    accountType: 'current',
    isDefault: false,
  });

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.paidByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transactionRef?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.transactionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
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

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportTransactions = () => {
    exportToCSV(filteredTransactions, 'transactions');
  };

  const handleExportInvoices = () => {
    exportToCSV(filteredInvoices, 'invoices');
  };

  const handleExportReport = () => {
    const reportData = {
      totalRevenue: mockStats.totalRevenue,
      totalExpected: mockStats.totalExpected,
      collectionRate: mockStats.collectionRate,
      pendingPayments: mockStats.pendingPayments,
      overduePayments: mockStats.overduePayments,
      generatedAt: new Date().toISOString(),
    };
    exportToCSV([reportData], 'financial-report');
  };

  // Review handler
  const handleReview = async () => {
    if (!selectedTransaction || !reviewAction) return;
    
    // Update transaction status
    setTransactions(prev => prev.map(t => {
      if (t.id === selectedTransaction.id) {
        return {
          ...t,
          transactionStatus: reviewAction === 'approve' ? 'VERIFIED' : 'REJECTED',
          reviewedByName: 'Current User',
          reviewedAt: new Date().toISOString(),
          reviewNotes: reviewNotes || undefined,
          rejectionReason: reviewAction === 'reject' ? rejectionReason : undefined,
        };
      }
      return t;
    }));
    
    setShowReviewModal(false);
    setSelectedTransaction(null);
    setReviewAction(null);
    setReviewNotes('');
    setRejectionReason('');
  };

  // Invoice handlers
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const student = availableStudents.find(s => s.id === newInvoice.studentId);
    const feeStructure = feeStructures.find(f => f.id === newInvoice.feeStructureId);
    
    if (!student || !feeStructure) return;
    
    const totalAmount = newInvoice.items.reduce((sum, item) => sum + item.amount, 0);
    
    const invoice: Invoice = {
      id: `inv${Date.now()}`,
      studentName: student.name,
      studentClass: student.class,
      admissionNumber: student.admissionNo,
      amount: totalAmount,
      paidAmount: 0,
      status: 'PENDING',
      dueDate: newInvoice.dueDate,
      academicYear: newInvoice.academicYear,
      term: newInvoice.term,
      feeName: feeStructure.name,
      items: newInvoice.items,
      createdAt: new Date().toISOString(),
    };
    
    setInvoices(prev => [invoice, ...prev]);
    setShowInvoiceModal(false);
    setNewInvoice({
      studentId: '',
      feeStructureId: '',
      items: [{ description: '', amount: 0 }],
      dueDate: '',
      academicYear: '2025/2026',
      term: 1,
    });
  };

  const handlePreviewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPreviewInvoiceModal(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // Fee structure handlers
  const handleAddFeeStructure = (e: React.FormEvent) => {
    e.preventDefault();
    const newFee: FeeStructure = {
      id: `fs${Date.now()}`,
      ...feeForm,
      createdAt: new Date().toISOString(),
    };
    setFeeStructures(prev => [...prev, newFee]);
    setShowAddFeeModal(false);
    setFeeForm({
      name: '',
      description: '',
      amount: 0,
      dueDate: '',
      academicYear: '2025/2026',
      term: 1,
      isActive: true,
    });
  };

  const handleEditFeeStructure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeStructure) return;
    
    setFeeStructures(prev => prev.map(f => 
      f.id === selectedFeeStructure.id ? { ...f, ...feeForm } : f
    ));
    setShowEditFeeModal(false);
    setSelectedFeeStructure(null);
  };

  const handleDeleteFeeStructure = () => {
    if (!showDeleteConfirm) return;
    setFeeStructures(prev => prev.filter(f => f.id !== showDeleteConfirm.id));
    setShowDeleteConfirm(null);
  };

  const openEditFeeModal = (fee: FeeStructure) => {
    setSelectedFeeStructure(fee);
    setFeeForm({
      name: fee.name,
      description: fee.description || '',
      amount: fee.amount,
      dueDate: fee.dueDate,
      academicYear: fee.academicYear,
      term: fee.term,
      isActive: fee.isActive,
    });
    setShowEditFeeModal(true);
  };

  // Bank account handlers
  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bank = NIGERIAN_BANKS.find(b => b.code === bankForm.bankCode);
    
    const newAccount: BankAccount = {
      id: `ba${Date.now()}`,
      ...bankForm,
      bankName: bank?.name || '',
      isActive: true,
    };
    
    // If setting as default, unset others
    if (newAccount.isDefault) {
      setBankAccounts(prev => prev.map(b => ({ ...b, isDefault: false })));
    }
    
    setBankAccounts(prev => [...prev, newAccount]);
    setShowAddBankModal(false);
    setBankForm({
      bankCode: '',
      accountNumber: '',
      accountName: '',
      accountType: 'current',
      isDefault: false,
    });
  };

  const handleEditBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankAccount) return;
    
    const bank = NIGERIAN_BANKS.find(b => b.code === bankForm.bankCode);
    
    // If setting as default, unset others
    if (bankForm.isDefault && !selectedBankAccount.isDefault) {
      setBankAccounts(prev => prev.map(b => ({ ...b, isDefault: false })));
    }
    
    setBankAccounts(prev => prev.map(b => 
      b.id === selectedBankAccount.id 
        ? { ...b, ...bankForm, bankName: bank?.name || b.bankName } 
        : b
    ));
    setShowEditBankModal(false);
    setSelectedBankAccount(null);
  };

  const handleDeleteBankAccount = () => {
    if (!showDeleteConfirm) return;
    setBankAccounts(prev => prev.filter(b => b.id !== showDeleteConfirm.id));
    setShowDeleteConfirm(null);
  };

  const openEditBankModal = (account: BankAccount) => {
    setSelectedBankAccount(account);
    setBankForm({
      bankCode: account.bankCode || '',
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      accountType: account.accountType,
      isDefault: account.isDefault,
    });
    setShowEditBankModal(true);
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
                {transactions.slice(0, 5).map((transaction) => (
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
          <button 
            onClick={handleExportTransactions}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-sm font-medium"
          >
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
          <button 
            onClick={() => setShowInvoiceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
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
                    <button 
                      onClick={() => handlePreviewInvoice(invoice)}
                      className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200"
                      title="Preview Invoice"
                    >
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
              {feeStructures.map((fee) => (
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
                      <button 
                        onClick={() => openEditFeeModal(fee)}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm({ type: 'fee', id: fee.id })}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        title="Delete"
                      >
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
        {bankAccounts.map((account) => (
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
                <button 
                  onClick={() => openEditBankModal(account)}
                  className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200"
                  title="Edit"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm({ type: 'bank', id: account.id })}
                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  title="Delete"
                >
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
          <button 
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-sm font-medium"
          >
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

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Create Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Student</label>
                  <select 
                    value={newInvoice.studentId}
                    onChange={(e) => setNewInvoice({...newInvoice, studentId: e.target.value})}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                    required
                  >
                    <option value="">Select Student</option>
                    {availableStudents.map(student => (
                      <option key={student.id} value={student.id}>{student.name} - {student.class}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Fee Structure</label>
                  <select 
                    value={newInvoice.feeStructureId}
                    onChange={(e) => {
                      const fee = feeStructures.find(f => f.id === e.target.value);
                      setNewInvoice({
                        ...newInvoice, 
                        feeStructureId: e.target.value,
                        items: fee ? [{ description: fee.name, amount: fee.amount }] : [{ description: '', amount: 0 }]
                      });
                    }}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                  >
                    <option value="">Select Fee</option>
                    {feeStructures.map(fee => (
                      <option key={fee.id} value={fee.id}>{fee.name} - {formatAmount(fee.amount)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Invoice Items</label>
                <div className="space-y-2">
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...newInvoice.items];
                          newItems[index].description = e.target.value;
                          setNewInvoice({...newInvoice, items: newItems});
                        }}
                        className="flex-1 px-4 py-3 border border-zinc-200 rounded-xl"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount || ''}
                        onChange={(e) => {
                          const newItems = [...newInvoice.items];
                          newItems[index].amount = parseFloat(e.target.value) || 0;
                          setNewInvoice({...newInvoice, items: newItems});
                        }}
                        className="w-32 px-4 py-3 border border-zinc-200 rounded-xl"
                      />
                      {newInvoice.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = newInvoice.items.filter((_, i) => i !== index);
                            setNewInvoice({...newInvoice, items: newItems});
                          }}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewInvoice({...newInvoice, items: [...newInvoice.items, { description: '', amount: 0 }]})}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Due Date</label>
                  <input 
                    type="date" 
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Term</label>
                  <select 
                    value={newInvoice.term}
                    onChange={(e) => setNewInvoice({...newInvoice, term: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                  >
                    <option value={1}>Term 1</option>
                    <option value={2}>Term 2</option>
                    <option value={3}>Term 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Academic Year</label>
                  <input 
                    type="text" 
                    value={newInvoice.academicYear}
                    onChange={(e) => setNewInvoice({...newInvoice, academicYear: e.target.value})}
                    placeholder="2025/2026"
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-zinc-900">Total Amount:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatAmount(newInvoice.items.reduce((sum, item) => sum + item.amount, 0))}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowInvoiceModal(false)} 
                    className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                  >
                    Create Invoice
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Invoice Modal */}
      {showPreviewInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto print:shadow-none">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center print:hidden">
              <h3 className="text-xl font-bold text-zinc-900">Invoice Preview</h3>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrintInvoice}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200"
                >
                  <Printer size={18} />
                  Print
                </button>
                <button 
                  onClick={() => setShowPreviewInvoiceModal(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-8 print:p-0">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900">INVOICE</h1>
                  <p className="text-zinc-500 mt-1">#{selectedInvoice.id.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-zinc-900">Greenfield Academy</p>
                  <p className="text-sm text-zinc-500">123 School Road, Lagos</p>
                  <p className="text-sm text-zinc-500">info@greenfield.edu.ng</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Bill To</p>
                  <p className="font-bold text-zinc-900">{selectedInvoice.studentName}</p>
                  <p className="text-sm text-zinc-500">{selectedInvoice.studentClass}</p>
                  <p className="text-sm text-zinc-500">Admission No: {selectedInvoice.admissionNumber}</p>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase">Invoice Date</p>
                    <p className="text-sm text-zinc-900">{selectedInvoice.createdAt ? format(new Date(selectedInvoice.createdAt), 'MMM d, yyyy') : '-'}</p>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase">Due Date</p>
                    <p className="text-sm text-zinc-900">{format(new Date(selectedInvoice.dueDate), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase">Status</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <table className="w-full mb-8">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Description</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-zinc-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {selectedInvoice.items ? (
                    selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4 text-sm text-zinc-900">{item.description}</td>
                        <td className="py-3 px-4 text-sm text-zinc-900 text-right">{formatAmount(item.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-3 px-4 text-sm text-zinc-900">{selectedInvoice.feeName}</td>
                      <td className="py-3 px-4 text-sm text-zinc-900 text-right">{formatAmount(selectedInvoice.amount)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Invoice Total */}
              <div className="border-t border-zinc-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-zinc-600">Total Amount</span>
                  <span className="font-bold text-zinc-900">{formatAmount(selectedInvoice.amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-zinc-600">Amount Paid</span>
                  <span className="font-medium text-green-600">{formatAmount(selectedInvoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-200">
                  <span className="font-bold text-zinc-900">Balance Due</span>
                  <span className="font-bold text-xl text-red-600">{formatAmount(selectedInvoice.amount - selectedInvoice.paidAmount)}</span>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="mt-8 pt-4 border-t border-zinc-200">
                <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Payment Instructions</p>
                <p className="text-sm text-zinc-600">Please make payment to any of the following accounts:</p>
                {bankAccounts.filter(b => b.isActive).map(account => (
                  <div key={account.id} className="mt-2 text-sm">
                    <p className="font-medium text-zinc-900">{account.bankName}</p>
                    <p className="text-zinc-600">Account Name: {account.accountName}</p>
                    <p className="text-zinc-600">Account Number: {account.accountNumber}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 text-center text-xs text-zinc-400">
                <p>Thank you for your business!</p>
                <p className="mt-1">For inquiries, please contact the bursar's office.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Fee Modal */}
      {(showAddFeeModal || showEditFeeModal) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">
                {showEditFeeModal ? 'Edit Fee Structure' : 'Add Fee Structure'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddFeeModal(false);
                  setShowEditFeeModal(false);
                  setSelectedFeeStructure(null);
                }} 
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={showEditFeeModal ? handleEditFeeStructure : handleAddFeeStructure} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Fee Name</label>
                <select 
                  value={feeForm.name}
                  onChange={(e) => setFeeForm({...feeForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                  required
                >
                  <option value="">Select Fee Type</option>
                  {NIGERIAN_FEE_TYPES.map(fee => (
                    <option key={fee} value={fee}>{fee}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Description</label>
                <input 
                  type="text"
                  value={feeForm.description}
                  onChange={(e) => setFeeForm({...feeForm, description: e.target.value})}
                  placeholder="Optional description"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Amount (₦)</label>
                <input 
                  type="number" 
                  value={feeForm.amount || ''}
                  onChange={(e) => setFeeForm({...feeForm, amount: parseFloat(e.target.value) || 0})}
                  placeholder="50000" 
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Due Date</label>
                  <input 
                    type="date" 
                    value={feeForm.dueDate}
                    onChange={(e) => setFeeForm({...feeForm, dueDate: e.target.value})}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Term</label>
                  <select 
                    value={feeForm.term}
                    onChange={(e) => setFeeForm({...feeForm, term: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                  >
                    <option value={1}>Term 1</option>
                    <option value={2}>Term 2</option>
                    <option value={3}>Term 3</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Academic Year</label>
                <input 
                  type="text" 
                  value={feeForm.academicYear}
                  onChange={(e) => setFeeForm({...feeForm, academicYear: e.target.value})}
                  placeholder="2025/2026" 
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={feeForm.isActive}
                  onChange={(e) => setFeeForm({...feeForm, isActive: e.target.checked})}
                  className="rounded border-zinc-300"
                />
                <label htmlFor="isActive" className="text-sm text-zinc-600">Active</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddFeeModal(false);
                    setShowEditFeeModal(false);
                    setSelectedFeeStructure(null);
                  }} 
                  className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                  {showEditFeeModal ? 'Save Changes' : 'Create Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Bank Modal */}
      {(showAddBankModal || showEditBankModal) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">
                {showEditBankModal ? 'Edit Bank Account' : 'Add Bank Account'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddBankModal(false);
                  setShowEditBankModal(false);
                  setSelectedBankAccount(null);
                }} 
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={showEditBankModal ? handleEditBankAccount : handleAddBankAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Bank Name</label>
                <select 
                  value={bankForm.bankCode}
                  onChange={(e) => setBankForm({...bankForm, bankCode: e.target.value})}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                  required
                >
                  <option value="">Select Bank</option>
                  {NIGERIAN_BANKS.map(bank => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Account Number</label>
                <input 
                  type="text" 
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                  placeholder="1234567890" 
                  maxLength={10} 
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Account Name</label>
                <input 
                  type="text" 
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({...bankForm, accountName: e.target.value})}
                  placeholder="School Name" 
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Account Type</label>
                <select 
                  value={bankForm.accountType}
                  onChange={(e) => setBankForm({...bankForm, accountType: e.target.value})}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl"
                >
                  <option value="current">Current</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isDefaultBank"
                  checked={bankForm.isDefault}
                  onChange={(e) => setBankForm({...bankForm, isDefault: e.target.checked})}
                  className="rounded border-zinc-300"
                />
                <label htmlFor="isDefaultBank" className="text-sm text-zinc-600">Set as default account</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddBankModal(false);
                    setShowEditBankModal(false);
                    setSelectedBankAccount(null);
                  }} 
                  className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                  {showEditBankModal ? 'Save Changes' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Confirm Delete</h3>
              <p className="text-zinc-600">
                Are you sure you want to delete this {showDeleteConfirm.type === 'fee' ? 'fee structure' : 'bank account'}?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200"
              >
                Cancel
              </button>
              <button 
                onClick={showDeleteConfirm.type === 'fee' ? handleDeleteFeeStructure : handleDeleteBankAccount}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
