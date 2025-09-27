import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Page } from '../types';

// FIX: Changed JSX.Element to React.ReactNode to fix 'Cannot find namespace JSX' error.
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode, onClick?: () => void }> = ({ title, value, icon, onClick }) => {
    const isClickable = !!onClick;
    const baseClasses = "bg-white p-4 rounded-lg shadow-md flex items-center border border-gray-100";
    const interactiveClasses = isClickable ? "transition-transform transform hover:scale-105 cursor-pointer" : "";

    return (
      <div className={`${baseClasses} ${interactiveClasses}`} onClick={onClick}>
          <div className="p-3 bg-brand-gold-light text-brand-gold-dark rounded-full mr-4">
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-brand-charcoal">{value}</p>
          </div>
      </div>
    );
};

const DashboardPage: React.FC<{setCurrentPage: (page: Page) => void}> = ({setCurrentPage}) => {
  const { inventory, customers, bills } = useAppContext();

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.amountPaid, 0);
    
  const totalPending = customers.reduce((sum, cust) => sum + cust.pendingBalance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Customers" value={customers.length} icon={<UsersIcon />} onClick={() => setCurrentPage('CUSTOMERS')} />
        <StatCard title="In Stock" value={inventory.filter(i => i.quantity > 0).length} icon={<InventoryIcon />} onClick={() => setCurrentPage('INVENTORY')} />
        <StatCard title="Revenue" value={formatCurrency(totalRevenue)} icon={<RevenueIcon />} onClick={() => setCurrentPage('REVENUE')} />
        <StatCard title="Pending" value={formatCurrency(totalPending)} icon={<PendingIcon />} onClick={() => setCurrentPage('PENDING_PAYMENTS')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Recent Invoices</h2>
          <div className="space-y-3">
            {bills.slice(0, 5).map(bill => (
              <div key={bill.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-semibold">{bill.customerName}</p>
                  <p className="text-xs text-gray-500">{new Date(bill.date).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-brand-charcoal-light">₹{bill.totalAmount.toLocaleString('en-IN')}</p>
              </div>
            ))}
             {bills.length === 0 && <p className="text-gray-500 text-center py-4">No recent invoices.</p>}
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-4">New Customers</h2>
           <div className="space-y-3">
              {customers.slice(-5).reverse().map(customer => (
                <div key={customer.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                   <div className="w-10 h-10 rounded-full mr-4 bg-brand-gold-light flex items-center justify-center font-bold text-brand-gold-dark">{customer.name.charAt(0)}</div>
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.phone}</p>
                  </div>
                </div>
              ))}
              {customers.length === 0 && <p className="text-gray-500 text-center py-4">No recent customers.</p>}
            </div>
        </div>
      </div>
    </div>
  );
};

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
const RevenueIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 21a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2Z"/>
        <path d="M8 7v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <path d="M10 13h6"/>
        <path d="M10 16h6"/>
        <path d="M12 11v8"/>
        <path d="M14 11c-1.5 0-3 1-3 3"/>
    </svg>
);
const PendingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

export default DashboardPage;