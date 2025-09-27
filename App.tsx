import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import InventoryPage from './components/InventoryPage';
import CustomersPage from './components/CustomersPage';
import BillingPage from './components/BillingPage';
import PendingPaymentsPage from './components/PendingPaymentsPage';
import SettingsPage from './components/SettingsPage';
import RevenuePage from './components/RevenuePage'; // Import new RevenuePage
import type { Page, GoogleTokenResponse } from './types';
import Logo from './components/Logo';
import { useAppContext } from './context/AppContext';
import useLocalStorage from './hooks/useLocalStorage';

const CLIENT_ID = "439419338091-qfb0i2fdjhkbgovuo7q28m6eqa5mr8ko.apps.googleusercontent.com";

const WelcomeScreen: React.FC = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-brand-champagne to-brand-pale-gold">
      <div className="text-center">
        <div className="relative w-40 h-40 mx-auto mb-8">
          <div className="absolute inset-0 border-2 border-brand-gold/30 rounded-full animate-ping"></div>
          <div className="absolute inset-2 border-2 border-brand-gold/50 rounded-full animate-ping [animation-delay:-0.5s]"></div>
          <img src="https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163" alt="Logo" className="w-40 h-40 object-contain" />
        </div>
        <h1 className="text-5xl font-serif tracking-wider text-brand-charcoal" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}>
          DEVAGIRIKAR
        </h1>
        <p className="text-2xl text-brand-gold-dark tracking-[0.2em]">JEWELLERYS</p>
      </div>
    </div>
);

const GetStartedScreen: React.FC = () => {
    const [gsiClient, setGsiClient] = useState<any>(null);
    const [, setTokenResponse] = useLocalStorage<GoogleTokenResponse | null>('googleTokenResponse', null);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        // @ts-ignore
        if (window.google) {
            // @ts-ignore
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.appdata',
                callback: (response: any) => {
                    setIsConnecting(false);
                    if (response.error) {
                         console.error('Error from Google:', response);
                         setError(`Failed to connect: ${response.error_description || response.error}. Please try again.`);
                         setTokenResponse(null);
                         return;
                    }
                    if (response.access_token) {
                        console.log('Received Access Token.');
                        const tokenData = {
                            ...response,
                            expires_at: Date.now() + (response.expires_in * 1000)
                        };
                        setTokenResponse(tokenData);
                        setError(null);
                        window.location.reload();
                    }
                },
            });
            setGsiClient(client);
        }
    }, []);

    const handleConnect = () => {
        if (gsiClient) {
            setIsConnecting(true);
            gsiClient.requestAccessToken();
        } else {
            setError('Google Sign-In is not ready yet. Please wait a moment and try again.');
        }
    };
    
    // White Diamond Patterned Button
    const DiamondPatternButton: React.FC<{ onClick: () => void, disabled: boolean, children: React.ReactNode }> = ({ onClick, disabled, children }) => {
        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className="
                    relative px-12 py-4 text-xl font-semibold text-brand-charcoal rounded-full
                    bg-gradient-to-br from-gray-50 to-gray-200
                    border border-white/50
                    shadow-lg
                    overflow-hidden
                    transition-all duration-200 ease-in-out
                    transform hover:scale-105 active:scale-95
                    disabled:cursor-wait disabled:opacity-70
                "
                aria-label="Get Started"
            >
                {/* Subtle diamond pattern overlay */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backgroundImage: `
                            linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%),
                            linear-gradient(-45deg, rgba(0,0,0,0.04) 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.04) 75%),
                            linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.04) 75%)
                        `,
                        backgroundSize: '20px 20px',
                        opacity: 0.8
                    }}
                ></div>
                
                {/* Text content */}
                <span className="relative z-10" style={{ textShadow: '0 1px 1px rgba(255, 255, 255, 0.5)' }}>
                    {children}
                </span>
            </button>
        );
    };


    return (
        <div 
            className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-brand-champagne to-brand-pale-gold p-8 text-brand-charcoal relative"
        >
            {/* Main Content */}
            <div className="flex flex-col items-center text-center z-10 absolute top-1/4">
                <img 
                  src="https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163" 
                  alt="Logo" 
                  className="w-40 h-40 object-contain mb-6"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
                />

                <h1 className="text-5xl font-serif tracking-wider text-brand-charcoal" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}>
                  DEVAGIRIKAR
                </h1>
                <p className="text-2xl text-brand-gold-dark tracking-[0.2em]">JEWELLERYS</p>
            </div>
            
            {/* Action Area */}
            <div className="absolute bottom-24 left-0 right-0 px-8 flex flex-col items-center z-10">
                 <DiamondPatternButton onClick={handleConnect} disabled={isConnecting}>
                    {isConnecting ? 'Connecting...' : 'Get Started'}
                 </DiamondPatternButton>
                 {error && <p className="text-red-600 mt-6 text-sm text-center">{error}</p>}
            </div>
            
            <footer className="absolute bottom-8 w-full text-center z-10">
                <p className="text-brand-gray/80 text-sm">Powered By Nano Neptune</p>
            </footer>
        </div>
    );
};

// New Global App Header
const AppHeader: React.FC = () => (
    <div className="absolute top-0 left-0 right-0 px-4 pt-4 md:px-8 z-10" style={{ paddingTop: `calc(1rem + env(safe-area-inset-top, 0px))` }}>
        <div className="flex items-center">
            <img src="https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163" alt="Logo" className="w-12 h-12 object-contain" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
            <div className="ml-2">
                <h1 className="text-xl font-serif tracking-wider text-brand-charcoal" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}>
                    DEVAGIRIKAR
                </h1>
                <p className="text-sm text-brand-gold-dark tracking-[0.1em] -mt-1">JEWELLERYS</p>
            </div>
        </div>
    </div>
);

// --- Icon Components for Navigation ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BillingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const AddUserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>;

// --- Global Modal and Forms ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                {children}
            </div>
        </div>
    );
};

const AddCustomerForm: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { addCustomer } = useAppContext();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (name && phone) {
            await addCustomer({
                name,
                phone,
                dob: dob || undefined,
            });
            onClose();
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Customer Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
            <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded" required />
            <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth (Optional)</label>
                <input type="date" id="dob" value={dob} onChange={e => setDob(e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-gold text-brand-charcoal p-3 rounded-lg font-semibold hover:bg-brand-gold-dark transition disabled:bg-gray-400">
              {isSubmitting ? 'Saving...' : 'Add Customer'}
            </button>
        </form>
    );
};

// New Bottom Navigation Bar with FAB
const BottomNavBar: React.FC<{ currentPage: Page; setCurrentPage: (page: Page) => void; onAddCustomerClick: () => void; }> = ({ currentPage, setCurrentPage, onAddCustomerClick }) => {
    const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
        { page: 'DASHBOARD', label: 'Dashboard', icon: <HomeIcon /> },
        { page: 'INVENTORY', label: 'Inventory', icon: <InventoryIcon /> },
        { page: 'CUSTOMERS', label: 'Customers', icon: <UsersIcon /> },
    ];
    const [isFabOpen, setIsFabOpen] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
                setIsFabOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFabAction = (action: () => void) => {
      action();
      setIsFabOpen(false);
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-28 z-30 flex justify-center">
             <div className="absolute bottom-0 left-0 right-0 h-20" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))' }}>
                <div className="flex justify-around items-center h-full bg-white/80 backdrop-blur-lg shadow-lg border border-black/5 mx-4 rounded-full">
                    {navItems.map((item, index) => (
                         <React.Fragment key={item.page}>
                            <button
                                onClick={() => setCurrentPage(item.page)}
                                className={`flex flex-col items-center justify-center w-20 h-full transition-colors duration-300
                                    ${currentPage === item.page ? 'text-brand-gold' : 'text-brand-gray'}`}
                                aria-label={item.label}
                            >
                                {item.icon}
                                <span className="text-xs mt-1">{item.label}</span>
                            </button>
                            {/* Spacer for FAB */}
                            {index === 1 && <div className="w-20 h-full" />}
                         </React.Fragment>
                    ))}
                </div>
            </div>

            {/* FAB and Menu */}
            <div ref={fabRef} className="absolute bottom-4 z-40">
                {isFabOpen && (
                     <div className="absolute bottom-full mb-4 w-52 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                        <button onClick={() => handleFabAction(onAddCustomerClick)} className="w-full flex items-center justify-start bg-white shadow-lg rounded-full text-left p-3 font-semibold hover:bg-gray-100 transition">
                            <AddUserIcon /> <span className="ml-3">Add Customer</span>
                        </button>
                         <button onClick={() => handleFabAction(() => setCurrentPage('BILLING'))} className="w-full flex items-center justify-start bg-white shadow-lg rounded-full text-left p-3 font-semibold hover:bg-gray-100 transition">
                            <BillingIcon /> <span className="ml-3">Create Bill</span>
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className={`w-16 h-16 rounded-full bg-brand-gold text-brand-charcoal shadow-lg flex items-center justify-center transform transition-transform duration-300 ${isFabOpen ? 'rotate-45' : ''}`}
                    aria-label="Create new item"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
            </div>
        </div>
    );
};


const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('DASHBOARD');
  const { isInitialized, isAuthenticated, error } = useAppContext();
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  if (!isInitialized) {
      return <WelcomeScreen />;
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
      return <GetStartedScreen />;
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
      case 'REVENUE':
        return <RevenuePage setCurrentPage={setCurrentPage} />;
      case 'SETTINGS':
        return <SettingsPage />;
      default:
        return <DashboardPage setCurrentPage={setCurrentPage}/>;
    }
  };

  return (
    <div className="flex h-screen font-sans text-brand-charcoal">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex flex-col flex-1 relative">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <div 
            className="px-4 md:p-8 h-full"
             style={{ 
                paddingTop: `calc(6rem + env(safe-area-inset-top, 0px))`, 
                paddingBottom: `calc(8rem + env(safe-area-inset-bottom, 0px))` 
            }}
           >
              {renderPage()}
          </div>
        </main>
        <Modal isOpen={isAddCustomerModalOpen} onClose={() => setIsAddCustomerModalOpen(false)} title="Add New Customer">
            <AddCustomerForm onClose={() => setIsAddCustomerModalOpen(false)} />
        </Modal>
        <BottomNavBar currentPage={currentPage} setCurrentPage={setCurrentPage} onAddCustomerClick={() => setIsAddCustomerModalOpen(true)} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
    return <AppContent />;
}
export default App;