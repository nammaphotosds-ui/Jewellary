
import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { GoogleTokenResponse } from '../types';

const SettingsPage: React.FC = () => {
    const [tokenResponse, setTokenResponse] = useLocalStorage<GoogleTokenResponse | null>('googleTokenResponse', null);

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

    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-charcoal mb-2">Settings</h1>
            <p className="text-gray-600 mb-8">Manage integrations and application settings.</p>

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
        </div>
    );
};

export default SettingsPage;
