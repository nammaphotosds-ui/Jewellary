import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Page } from '../types';

// FIX: Destructured `setCurrentPage` from props to make it available within the component's scope.
const RevenuePage: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
    const { bills, setRevenue } = useAppContext();
    const sortedBills = [...bills].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const [isEditing, setIsEditing] = useState(false);
    const [newRevenue, setNewRevenue] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.amountPaid, 0);

    const handleEditClick = () => {
        setNewRevenue(totalRevenue.toString());
        setIsEditing(true);
        setSaveStatus('idle');
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setNewRevenue('');
    };

    const handleSaveClick = async () => {
        const newTotal = parseFloat(newRevenue);
        if (isNaN(newTotal) || newTotal < 0) {
            alert('Please enter a valid, non-negative number.');
            return;
        }
        setSaveStatus('saving');
        try {
            await setRevenue(newTotal);
            setSaveStatus('saved');
            setTimeout(() => {
                setIsEditing(false);
                setSaveStatus('idle');
            }, 1000);
        } catch (error) {
            console.error("Failed to set revenue:", error);
            alert("An error occurred while saving the new revenue amount. Please try again.");
            setSaveStatus('idle');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const StatusIcon: React.FC<{ isPending: boolean }> = ({ isPending }) => {
        if (isPending) {
            return (
                <div className="flex items-center text-orange-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>Pending</span>
                </div>
            );
        }
        return (
            <div className="flex items-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>Paid</span>
            </div>
        );
    };

    return (
        <div>
             <div className="flex items-center mb-6">
                <button onClick={() => setCurrentPage('DASHBOARD')} className="flex items-center text-gray-600 hover:text-brand-charcoal transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Back to Dashboard
                </button>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                    <h1 className="text-2xl font-bold">Revenue Details</h1>
                     <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <input
                                    type="number"
                                    value={newRevenue}
                                    onChange={(e) => setNewRevenue(e.target.value)}
                                    className="p-2 border rounded-md w-40 text-right font-semibold"
                                    disabled={saveStatus !== 'idle'}
                                    autoFocus
                                />
                                <button
                                    onClick={handleSaveClick}
                                    disabled={saveStatus !== 'idle'}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:opacity-70"
                                >
                                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                                </button>
                                <button
                                    onClick={handleCancelClick}
                                    disabled={saveStatus !== 'idle'}
                                    className="px-4 py-2 bg-gray-200 rounded-md text-sm disabled:opacity-70"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-2xl font-bold text-brand-gold-dark">{formatCurrency(totalRevenue)}</span>
                                <button onClick={handleEditClick} className="p-2 text-gray-500 hover:text-brand-charcoal" aria-label="Edit total revenue">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3">Customer</th>
                                <th className="p-3">Date</th>
                                <th className="p-3 text-right">Total Amount</th>
                                <th className="p-3 text-right">Amount Paid</th>
                                <th className="p-3 text-right">Balance</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedBills.map(bill => (
                                <tr key={bill.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-semibold">{bill.customerName}</td>
                                    <td className="p-3 text-sm text-gray-600">{new Date(bill.date).toLocaleDateString()}</td>
                                    <td className="p-3 text-right font-medium">{formatCurrency(bill.grandTotal)}</td>
                                    <td className="p-3 text-right text-green-700">{formatCurrency(bill.amountPaid)}</td>
                                    <td className="p-3 text-right font-bold text-red-600">{formatCurrency(bill.balance)}</td>
                                    <td className="p-3 text-sm font-semibold"><StatusIcon isPending={bill.balance > 0} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {sortedBills.map(bill => (
                        <div key={bill.id} className="bg-gray-50 p-4 rounded-lg border">
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold">{bill.customerName}</p>
                                    <p className="text-xs text-gray-500">{new Date(bill.date).toLocaleDateString()}</p>
                                </div>
                                <StatusIcon isPending={bill.balance > 0} />
                            </div>
                            <div className="mt-4 border-t pt-2 grid grid-cols-3 text-center">
                                <div>
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="font-semibold">{formatCurrency(bill.grandTotal)}</p>
                                </div>
                                 <div>
                                    <p className="text-xs text-gray-500">Paid</p>
                                    <p className="font-semibold text-green-700">{formatCurrency(bill.amountPaid)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Balance</p>
                                    <p className="font-bold text-red-600">{formatCurrency(bill.balance)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                 {bills.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <p>No revenue data to display yet.</p>
                        <p>Create an invoice to see your revenue grow.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default RevenuePage;