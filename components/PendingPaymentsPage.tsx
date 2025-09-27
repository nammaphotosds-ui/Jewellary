import React from 'react';
import { useAppContext } from '../context/AppContext';

const PendingPaymentsPage: React.FC = () => {
  const { customers } = useAppContext();

  const customersWithPendingBalance = customers
    .filter(customer => customer.pendingBalance > 0)
    .sort((a, b) => b.pendingBalance - a.pendingBalance);

  return (
    <div>
        <div className="text-center md:text-left mb-8">
             <h1 className="text-4xl md:text-5xl font-serif tracking-wide text-brand-charcoal" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}>Pending Payments</h1>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white p-6 rounded-lg shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4">Customer ID</th>
                            <th className="p-4">Customer Name</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4 text-right">Pending Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customersWithPendingBalance.map((customer) => (
                            <tr key={customer.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-mono text-gray-600">{customer.id}</td>
                                <td className="p-4 font-semibold">{customer.name}</td>
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
                <div key={customer.id} className="bg-white p-4 rounded-lg shadow-md border">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.phone}</p>
                            <p className="text-xs font-mono text-gray-500">{customer.id}</p>
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