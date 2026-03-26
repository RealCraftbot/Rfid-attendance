import React from 'react';
import { format } from 'date-fns';
import { Building } from 'lucide-react';

interface ReceiptProps {
  organization: {
    name: string;
    logoUrl?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string;
  };
  student: {
    name: string;
    class?: string;
    admissionNumber?: string;
  };
  payment: {
    id: string;
    amount: number;
    paymentMethod: string;
    transactionDate: string;
    transactionRef?: string;
    status: string;
  };
  type: 'payment' | 'invoice' | 'receipt';
}

export function ReceiptTemplate({ organization, student, payment, type }: ReceiptProps) {
  return (
    <div className="bg-white p-8 max-w-2xl mx-auto border border-zinc-200">
      {/* Header with Logo */}
      <div className="border-b-2 border-blue-600 pb-6 mb-6">
        <div className="flex items-center gap-4">
          {organization.logoUrl ? (
            <img 
              src={organization.logoUrl} 
              alt={organization.name}
              className="w-16 h-16 object-contain"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-blue-900">{organization.name}</h1>
            {organization.address && (
              <p className="text-sm text-zinc-600">{organization.address}</p>
            )}
            {(organization.phone || organization.email) && (
              <p className="text-sm text-zinc-600">
                {organization.phone && `Tel: ${organization.phone}`}
                {organization.phone && organization.email && ' | '}
                {organization.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Receipt/Invoice Title */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase tracking-wide">
          {type === 'invoice' ? 'Fee Invoice' : type === 'receipt' ? 'Payment Receipt' : 'Payment Confirmation'}
        </h2>
        <p className="text-sm text-zinc-500 mt-1">{format(new Date(), 'MMMM dd, yyyy')}</p>
      </div>

      {/* Student Info */}
      <div className="bg-zinc-50 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-bold text-zinc-700 uppercase mb-2">Student Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Name:</span>
            <span className="ml-2 font-medium">{student.name}</span>
          </div>
          {student.class && (
            <div>
              <span className="text-zinc-500">Class:</span>
              <span className="ml-2 font-medium">{student.class}</span>
            </div>
          )}
          {student.admissionNumber && (
            <div>
              <span className="text-zinc-500">Admission No:</span>
              <span className="ml-2 font-medium">{student.admissionNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-zinc-700 uppercase mb-3">Payment Details</h3>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-zinc-200">
            <tr>
              <td className="py-2 text-zinc-600">Reference Number</td>
              <td className="py-2 text-right font-medium">{payment.id}</td>
            </tr>
            <tr>
              <td className="py-2 text-zinc-600">Amount Paid</td>
              <td className="py-2 text-right font-bold text-lg text-blue-600">
                ₦{payment.amount.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="py-2 text-zinc-600">Payment Method</td>
              <td className="py-2 text-right font-medium">{payment.paymentMethod}</td>
            </tr>
            <tr>
              <td className="py-2 text-zinc-600">Date</td>
              <td className="py-2 text-right font-medium">
                {format(new Date(payment.transactionDate), 'MMM dd, yyyy HH:mm')}
              </td>
            </tr>
            {payment.transactionRef && (
              <tr>
                <td className="py-2 text-zinc-600">Transaction Ref</td>
                <td className="py-2 text-right font-medium">{payment.transactionRef}</td>
              </tr>
            )}
            <tr>
              <td className="py-2 text-zinc-600">Status</td>
              <td className="py-2 text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  payment.status === 'VERIFIED' || payment.status === 'PAID' || payment.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-700'
                    : payment.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {payment.status}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 pt-6 mt-8">
        <div className="flex justify-between items-end">
          <div className="text-xs text-zinc-500">
            <p>This is a computer-generated document.</p>
            <p>For inquiries, please contact the school bursar.</p>
          </div>
          <div className="text-right">
            <div className="w-24 h-24 border-2 border-dashed border-zinc-300 rounded flex items-center justify-center">
              <span className="text-xs text-zinc-400 text-center">Official<br/>Stamp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export a printable version
export function PrintableReceipt({ organization, student, payment, type }: ReceiptProps) {
  return (
    <div className="print:p-0">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>
      <ReceiptTemplate 
        organization={organization} 
        student={student} 
        payment={payment} 
        type={type} 
      />
    </div>
  );
}

export default ReceiptTemplate;
