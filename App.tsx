import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import InventoryPage from './components/InventoryPage';
import CustomersPage from './components/CustomersPage';
import BillingPage from './components/BillingPage';
import PendingPaymentsPage from './components/PendingPaymentsPage';
import SettingsPage from './components/SettingsPage';
import type { Page, GoogleTokenResponse } from './types';
import { pageTitles } from './types';
import Logo from './components/Logo';
import { useAppContext } from './context/AppContext';
import useLocalStorage from './hooks/useLocalStorage';

const CLIENT_ID = "439419338091-qfb0i2fdjhkbgovuo7q28m6eqa5mr8ko.apps.googleusercontent.com";

const WelcomeScreen: React.FC = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-brand-charcoal">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-2 border-brand-gold/30 rounded-full animate-ping"></div>
          <div className="absolute inset-2 border-2 border-brand-gold/50 rounded-full animate-ping [animation-delay:-0.5s]"></div>
          <img src="https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163" alt="Logo" className="w-24 h-24 object-contain" />
        </div>
        <h1 className="text-3xl font-serif tracking-wider text-white" style={{ textShadow: '0 0 10px #daa520, 0 0 20px #daa520' }}>
          DEVAGIRIKAR
        </h1>
        <p className="text-lg text-brand-gold-light tracking-[0.2em]">JEWELLERYS</p>
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
    
    // Creative & Satisfying 3D Button
    const GoldenButton: React.FC<{ onClick: () => void, disabled: boolean, children: React.ReactNode }> = ({ onClick, disabled, children }) => {
        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className="group relative px-12 py-4 text-xl font-semibold rounded-lg text-brand-charcoal
                           transition-transform duration-150 ease-out 
                           transform active:translate-y-1
                           disabled:cursor-wait disabled:opacity-70"
                aria-label="Get Started"
            >
                {/* 3D Depth Layer */}
                <span className="absolute inset-0 bg-gradient-to-t from-amber-700 to-amber-500 rounded-lg shadow-lg transform translate-y-1 group-active:translate-y-0 transition-transform duration-150 ease-out"></span>

                {/* Button Face Layer */}
                <span className="absolute inset-0 bg-gradient-to-t from-yellow-400 to-amber-400 rounded-lg border border-amber-500/80 transform group-hover:-translate-y-1 group-active:translate-y-0 transition-transform duration-150 ease-out"></span>

                {/* Text Content */}
                <span
                    className="relative"
                    style={{ textShadow: '0 1px 1px rgba(255, 255, 255, 0.4)' }}
                >
                    {children}
                </span>
            </button>
        );
    };


    return (
        <div 
            className="flex h-screen w-screen flex-col items-center justify-center bg-brand-charcoal p-8 text-white relative overflow-hidden"
            style={{ backgroundImage: 'radial-gradient(circle at 15% 25%, rgba(218, 165, 32, 0.15), transparent 40%), radial-gradient(circle at 85% 75%, rgba(253, 251, 246, 0.1), transparent 40%)' }}
        >
            {/* Main Content */}
            <div className="flex flex-col items-center text-center z-10 absolute top-1/4">
                <img src="https://ik.imagekit.io/9y4qtxuo0/IMG_20250927_202057_913.png?updatedAt=1758984948163" alt="Logo" className="w-40 h-40 object-contain mb-6 animate-pulse" style={{ animationDuration: '3s' }}/>

                <h1 className="text-5xl font-serif tracking-wider text-white" style={{ textShadow: '0 0 10px #daa520, 0 0 20px #daa520' }}>
                  DEVAGIRIKAR
                </h1>
                <p className="text-2xl text-brand-gold-light tracking-[0.2em]">JEWELLERYS</p>
            </div>
            
            {/* Action Area */}
            <div className="absolute bottom-24 left-0 right-0 px-8 flex flex-col items-center z-10">
                 <GoldenButton onClick={handleConnect} disabled={isConnecting}>
                    {isConnecting ? 'Connecting...' : 'Get Started'}
                 </GoldenButton>
                 {error && <p className="text-red-400 mt-6 text-sm text-center">{error}</p>}
            </div>
            
            <footer className="absolute bottom-8 w-full text-center z-10">
                <p className="text-gray-400 text-sm">Powered By Nano Neptune</p>
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
    <div className="flex h-screen bg-brand-cream font-sans text-brand-charcoal">
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
    <h1 className="text-lg font-bold text-brand-charcoal-light">{pageTitles[page]}</h1>
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