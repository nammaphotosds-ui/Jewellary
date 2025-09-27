
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import InventoryPage from './components/InventoryPage';
import CustomersPage from './components/CustomersPage';
import BillingPage from './components/BillingPage';
import PendingPaymentsPage from './components/PendingPaymentsPage';
import SettingsPage from './components/SettingsPage';
import type { Page } from './types';
import { pageTitles } from './types';
import Logo from './components/Logo';
import { useAppContext } from './context/AppContext';

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
    <div className="flex h-screen w-screen items-center justify-center bg-brand-light">
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-gold animate-spin mx-auto mb-4">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
        </svg>
        <p className="text-brand-dark-light font-semibold">{message}</p>
      </div>
    </div>
);

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('DASHBOARD');
  const { isInitialized, isAuthenticated, error } = useAppContext();

  if (!isInitialized) {
      return <LoadingScreen message="Initializing Application..." />;
  }

  if (error) {
      return (
           <div className="flex h-screen w-screen items-center justify-center bg-red-50 p-4">
              <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
                <h1 className="text-2xl font-bold text-red-700 mb-4">An Error Occurred</h1>
                <p className="text-red-600 mb-6">{error}</p>
                <p className="text-gray-600">Please try refreshing the page or reconnecting to Google Drive from the settings menu.</p>
              </div>
            </div>
      );
  }

  if (!isAuthenticated) {
      // Force user to the settings page to connect to Google Drive
      return (
           <div className="flex h-screen bg-brand-light font-sans text-brand-dark">
              <Sidebar currentPage={'SETTINGS'} setCurrentPage={() => {}} />
              <div className="flex flex-col flex-1">
                 <main className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-8">
                       <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
                            <h3 className="font-bold text-yellow-800">Connection Required</h3>
                            <p className="text-yellow-700">Please connect to Google Drive to load your data and use the application.</p>
                        </div>
                        <SettingsPage />
                    </div>
                 </main>
              </div>
           </div>
      );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'DASHBOARD':
        return <DashboardPage setCurrentPage={setCurrentPage} />;
      case 'INVENTORY':
        return <InventoryPage />;
      case 'CUSTOMERS':
      	return <CustomersPage />;
      case 'BILLING':
        return <BillingPage setCurrentPage={setCurrentPage} />;
      case 'PENDING_PAYMENTS':
        return <PendingPaymentsPage />;
      case 'SETTINGS':
        return <SettingsPage />;
      default:
        return <DashboardPage setCurrentPage={setCurrentPage}/>;
    }
  };

  return (
    <div className="flex h-screen bg-brand-light font-sans text-brand-dark">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex flex-col flex-1">
        <MobileHeader page={currentPage} />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="p-4 md:p-8">
              {renderPage()}
          </div>
        </main>
        <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
};


const MobileHeader: React.FC<{ page: Page }> = ({ page }) => (
  <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-sm z-10 shadow-sm p-3 flex justify-between items-center">
    <Logo />
    <h1 className="text-lg font-bold text-brand-dark-light">{pageTitles[page]}</h1>
  </header>
);

const BottomNav: React.FC<{ currentPage: Page; setCurrentPage: (page: Page) => void; }> = ({ currentPage, setCurrentPage }) => {
  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'DASHBOARD', label: 'Dashboard', icon: <HomeIcon /> },
    { page: 'INVENTORY', label: 'Inventory', icon: <InventoryIcon /> },
    { page: 'CUSTOMERS', label: 'Customers', icon: <UsersIcon /> },
    { page: 'BILLING', label: 'Billing', icon: <BillingIcon /> },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-20 flex justify-around items-start pt-2 pb-1">
      {navItems.map(item => (
        <button key={item.page} onClick={() => setCurrentPage(item.page)} className="flex flex-col items-center justify-center gap-1 w-20">
          <span className={`${currentPage === item.page ? 'text-brand-gold' : 'text-gray-500'} transition-colors`}>{item.icon}</span>
          <span className={`text-xs ${currentPage === item.page ? 'text-brand-gold font-semibold' : 'text-gray-600'} transition-colors`}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

// --- Icon Components for Navigation ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BillingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;

const App: React.FC = () => {
    return <AppContent />;
}
export default App;
