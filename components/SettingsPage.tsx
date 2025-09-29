import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { GoogleTokenResponse } from '../types';
import { useAppContext } from '../context/AppContext';

const SettingsPage: React.FC = () => {
    const [tokenResponse, setTokenResponse] = useLocalStorage<GoogleTokenResponse | null>('googleTokenResponse', null);
    const { resetTransactions } = useAppContext();
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    const handleToggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Could not enter full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const handleDisconnect = () => {
        if (tokenResponse) {
             // @ts-ignore
            window.google.accounts.oauth2.revoke(tokenResponse.access_token, () => {
                console.log('Token revoked.');
            });
        }
        setTokenResponse(null);
        window.location.reload();
    };

    const handleResetTransactions = async () => {
        if (window.confirm("Are you sure you want to delete ALL bills and transaction history? This will reset all revenue and pending payments to zero. This action CANNOT be undone.")) {
            try {
                await resetTransactions();
                alert("All transaction data has been reset successfully.");
            } catch (error) {
                alert("An error occurred while resetting data. Please try again.");
                console.error("Reset data error:", error);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h2 className="text-xl font-bold mb-2">Google Drive Integration</h2>
                <p className="text-gray-600 mb-4">Your application data is securely stored and synced with your connected Google Drive account.</p>
                
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 mr-3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        <div>
                            <h3 className="font-bold text-green-800">Successfully Connected to Google Drive!</h3>
                            <p className="text-sm text-green-700">Your data is being stored and synced automatically.</p>
                        </div>
                    </div>
                     <button onClick={handleDisconnect} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition text-sm">
                        Disconnect and clear local data
                    </button>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h2 className="text-xl font-bold mb-2">Display Settings</h2>
                <p className="text-gray-600 mb-4">For a more immersive experience, you can enter full-screen mode. This will hide the system status bar.</p>
                <button
                    onClick={handleToggleFullscreen}
                    className="bg-brand-gold text-brand-charcoal px-6 py-2 rounded-lg font-semibold hover:bg-brand-gold-dark transition"
                >
                    {isFullscreen ? 'Exit Full-Screen' : 'Enter Full-Screen'}
                </button>
            </div>

            <div className="bg-red-50 p-6 rounded-lg shadow-inner border border-red-200">
                <h2 className="text-xl font-bold text-red-800 mb-2">Danger Zone</h2>
                <p className="text-red-700 mb-4">Permanently delete all transaction data. This will reset revenue and pending balances to zero. This action cannot be undone.</p>
                <button 
                    onClick={handleResetTransactions} 
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                    Reset All Transactions
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;