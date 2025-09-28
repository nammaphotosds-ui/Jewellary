import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Customer } from '../types';

const Avatar: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <div className={`flex items-center justify-center rounded-full bg-brand-gold-light text-brand-gold-dark ${className}`}>
            <span className="font-serif text-xl">{initial}</span>
        </div>
    );
};

const PaymentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    customerName: string;
    pendingBalance: number;
    onRecordPayment: (amount: number) => Promise<void>;
}> = ({ isOpen, onClose, customerName, pendingBalance, onRecordPayment }) => {
    const [amount, setAmount] = useState(pendingBalance.toString());
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        if (isOpen) {
            setAmount(pendingBalance.toString());
            setSubmissionStatus('idle');
        }
    }, [pendingBalance, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount > pendingBalance) {
            alert('Please enter a valid amount greater than zero and not exceeding the pending balance.');
            return;
        }
        setSubmissionStatus('saving');
        try {
            await onRecordPayment(paymentAmount);
            setSubmissionStatus('saved');
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error("Failed to record payment:", error);
            alert("An error occurred while recording the payment. Please try again.");
            setSubmissionStatus('idle');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                <h2 className="text-2xl font-bold mb-2">Record Payment</h2>
                <p className="text-sm text-gray-600 mb-4">For {customerName}</p>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">Payment Amount (₹)</label>
                        <input
                            type="number"
                            id="paymentAmount"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-lg"
                            step="0.01"
                            max={pendingBalance}
                            required
                            autoFocus
                        />
                         <p className="text-xs text-gray-500 mt-1">Total pending: ₹{pendingBalance.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" disabled={submissionStatus !== 'idle'} className="px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:opacity-70">
                            {submissionStatus === 'saving' ? 'Saving...' : submissionStatus === 'saved' ? 'Saved!' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PendingPaymentDetailsView: React.FC<{
    customer: Customer;
    onBack: () => void;
    onDelete: () => Promise<void>;
}> = ({ customer, onBack, onDelete }) => {
    const { recordPayment } = useAppContext();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${customer.name}? This will remove the customer and all their transaction history.`)) {
            setIsDeleting(true);
            await onDelete();
            setIsDeleting(false);
            onBack();
        }
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-gray-600 hover:text-brand-charcoal transition mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to Pending List
            </button>
            <div className="bg-white p-6 rounded-lg shadow-md border text-center">
                 <Avatar name={customer.name} className="w-24 h-24 mx-auto !text-5xl border-4 border-red-200" />
                 <h2 className="text-3xl font-bold font-serif text-brand-charcoal mt-4">{customer.name}</h2>
                 <p className="text-gray-600 mt-1">{customer.phone}</p>
                 <p className="font-mono text-sm text-gray-500">{customer.id}</p>

                 <div className="mt-6 bg-red-50 p-6 rounded-lg">
                    <p className="text-sm font-semibold text-red-700 uppercase">Pending Balance</p>
                    <p className="text-5xl font-bold text-red-600 my-2">₹{customer.pendingBalance.toLocaleString('en-IN')}</p>
                 </div>

                 <div className="mt-6 flex flex-col md:flex-row justify-center gap-4">
                     <button onClick={() => setIsPaymentModalOpen(true)} disabled={isDeleting} className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center shadow-md disabled:bg-gray-400">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                         Record Payment
                     </button>
                     <button onClick={handleDelete} disabled={isDeleting} className="w-full md:w-auto bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center shadow-md disabled:bg-gray-400">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                         {isDeleting ? 'Deleting...' : 'Delete Customer'}
                     </button>
                 </div>
            </div>
             <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                customerName={customer.name}
                pendingBalance={customer.pendingBalance}
                onRecordPayment={async (amount) => {
                    await recordPayment(customer.id, amount);
                    const updatedCustomer = { ...customer, pendingBalance: customer.pendingBalance - amount };
                    if (updatedCustomer.pendingBalance <= 0) {
                        onBack();
                    }
                }}
            />
        </div>
    );
};


const PendingPaymentsPage: React.FC = () => {
  const { customers, deleteCustomer } = useAppContext();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const customersWithPendingBalance = customers
    .filter(customer => customer.pendingBalance > 0)
    .sort((a, b) => b.pendingBalance - a.pendingBalance);
    
  if (selectedCustomer) {
      const customerDetails = customers.find(c => c.id === selectedCustomer.id);
      if (customerDetails) {
          return <PendingPaymentDetailsView
                    customer={customerDetails}
                    onBack={() => setSelectedCustomer(null)}
                    onDelete={() => deleteCustomer(customerDetails.id)}
                 />
      }
  }

  return (
    <div>
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white p-6 rounded-lg shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4">Customer</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4 text-right">Pending Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customersWithPendingBalance.map((customer) => (
                            <tr key={customer.id} onClick={() => setSelectedCustomer(customer)} className="border-b hover:bg-gray-50 cursor-pointer">
                                <td className="p-4">
                                    <div className="flex items-center">
                                        <Avatar name={customer.name} className="w-10 h-10 mr-4"/>
                                        <div>
                                            <p className="font-semibold">{customer.name}</p>
                                            <p className="text-xs font-mono text-gray-500">{customer.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">{customer.phone}</td>
                                <td className="p-4 text-right font-bold text-red-600">
                                    {customer.pendingBalance.toLocaleString('en-IN')}
                                </td>
                            </tr>
                        ))}
                         {customersWithPendingBalance.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-gray-500">No pending payments. Well done!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
            {customersWithPendingBalance.map((customer) => (
                <div key={customer.id} onClick={() => setSelectedCustomer(customer)} className="bg-white p-4 rounded-lg shadow-md border active:scale-95 transition-transform cursor-pointer">
                    <div className="flex items-center">
                         <Avatar name={customer.name} className="w-12 h-12 mr-4"/>
                         <div className="flex-1">
                            <p className="font-bold text-lg">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.phone}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-xs text-red-500">Pending</p>
                             <p className="font-bold text-lg text-red-600">
                                ₹{customer.pendingBalance.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
            {customersWithPendingBalance.length === 0 && (
                <div className="text-center p-16 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">No pending payments. Well done!</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default PendingPaymentsPage;