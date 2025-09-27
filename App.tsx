import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import InventoryPage from './components/InventoryPage';
import CustomersPage from './components/CustomersPage';
import BillingPage from './components/BillingPage';
import PendingPaymentsPage from './components/PendingPaymentsPage';
import SettingsPage from './components/SettingsPage';
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


const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('DASHBOARD');
  const { isInitialized, isAuthenticated, error } = useAppContext();

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
      case 'SETTINGS':
        return <SettingsPage />;
      default:
        return <DashboardPage setCurrentPage={setCurrentPage}/>;
    }
  };

  return (
    <div className="flex h-screen font-sans text-brand-charcoal">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto">
          <div 
            className="px-4 pb-32 md:p-8 h-full"
            style={{ paddingTop: `calc(1.5rem + env(safe-area-inset-top, 0px))` }}
           >
              {renderPage()}
          </div>
        </main>
        <FloatingNavMenu currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
};

const FloatingNavMenu: React.FC<{ currentPage: Page; setCurrentPage: (page: Page) => void; }> = ({ currentPage, setCurrentPage }) => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
        { page: 'DASHBOARD', label: 'Dashboard', icon: <HomeIcon /> },
        { page: 'INVENTORY', label: 'Inventory', icon: <InventoryIcon /> },
        { page: 'CUSTOMERS', label: 'Customers', icon: <UsersIcon /> },
        { page: 'BILLING', label: 'Create Bill', icon: <BillingIcon /> },
        { page: 'PENDING_PAYMENTS', label: 'Pending', icon: <PendingIcon /> },
        { page: 'SETTINGS', label: 'Settings', icon: <SettingsIcon /> },
    ];
    
    const handleSelect = (page: Page) => {
        setCurrentPage(page);
        setIsOpen(false);
    }

    return (
        <div className="md:hidden">
            {/* Overlay */}
            {isOpen && (
                 <div
                    className="fixed inset-0 bg-brand-charcoal/50 backdrop-blur-sm z-30"
                    onClick={() => setIsOpen(false)}
                 ></div>
            )}
            
            {/* Menu Content */}
            <div
                className={`fixed bottom-0 left-0 right-0 bg-brand-cream p-6 rounded-t-3xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.3)] z-40 transition-transform duration-300 ease-in-out
                ${isOpen ? 'transform translate-y-0' : 'transform translate-y-full'}`}
                style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
            >
                <h2 className="text-sm font-semibold text-gray-500 mb-4 tracking-wider uppercase">Menu</h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                    {navItems.map(item => (
                        <button key={item.page} onClick={() => handleSelect(item.page)} className="flex flex-col items-center justify-center gap-2 p-2 rounded-lg hover:bg-brand-pale-gold transition-colors">
                            <span className={`${currentPage === item.page ? 'text-brand-gold' : 'text-gray-600'}`}>{item.icon}</span>
                            <span className={`text-xs font-semibold ${currentPage === item.page ? 'text-brand-gold' : 'text-brand-charcoal'}`}>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed right-6 bg-brand-gold text-brand-charcoal w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-40 transform transition-transform active:scale-90"
                style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
                aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
            >
                <div className="relative w-6 h-6 flex items-center justify-center">
                    <span className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${isOpen ? 'rotate-45' : '-translate-y-2'}`}></span>
                    <span className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${isOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${isOpen ? '-rotate-45' : 'translate-y-2'}`}></span>
                </div>
            </button>
        </div>
    )
}

// --- Icon Components for Navigation ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BillingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const PendingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

const App: React.FC = () => {
    return <AppContent />;
}
export default App;