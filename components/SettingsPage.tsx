import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// This is your public Client ID. It is safe to be here.
const CLIENT_ID = "439419338091-qfb0i2fdjhkbgovuo7q28m6eqa5mr8ko.apps.googleusercontent.com";

const SettingsPage: React.FC = () => {
    const [gsiClient, setGsiClient] = useState<any>(null);
    const [authCode, setAuthCode] = useLocalStorage<string | null>('googleAuthCode', null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // @ts-ignore
        if (window.google) {
            // @ts-ignore
            const client = window.google.accounts.oauth2.initCodeClient({
                client_id: CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: (response) => {
                    if (response.code) {
                        console.log('Received Authorization Code:', response.code);
                        setAuthCode(response.code);
                        setError(null);
                    } else {
                        console.error('Error from Google:', response);
                        setError('Failed to get authorization code from Google.');
                        setAuthCode(null);
                    }
                },
            });
            setGsiClient(client);
        }
    }, []);

    const handleConnect = () => {
        if (gsiClient) {
            gsiClient.requestCode();
        } else {
            setError('Google Sign-In is not ready yet. Please wait a moment and try again.');
        }
    };

    const handleDisconnect = () => {
        setAuthCode(null);
        setError(null);
        // Note: This does not revoke permissions from the user's Google account.
        // That must be done manually by the user in their Google account settings.
    };

    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-2">Settings</h1>
            <p className="text-gray-600 mb-8">Manage integrations and application settings.</p>

            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h2 className="text-xl font-bold mb-2">Google Drive Integration</h2>
                <p className="text-gray-600 mb-4">Connect your Google Drive account to store customer photos and documents securely. This app will only have permission to create new files; it cannot see or access your existing files.</p>
                
                {authCode ? (
                    <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 mr-3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <div>
                                <h3 className="font-bold text-green-800">Successfully Connected!</h3>
                                <p className="text-sm text-green-700">The application is now authorized.</p>
                            </div>
                        </div>
                        <div className="mt-4">
                             <p className="text-xs text-gray-700">
                                <strong>Next Step:</strong> Provide the Authorization Code below to your backend developer to complete the integration. Your backend server will use this code to get permanent access to the API.
                            </p>
                            <code className="block w-full bg-gray-100 p-2 mt-2 rounded text-xs text-gray-800 break-words">{authCode}</code>
                        </div>
                         <button onClick={handleDisconnect} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition text-sm">
                            Disconnect
                        </button>
                    </div>
                ) : (
                     <button onClick={handleConnect} className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-semibold hover:bg-brand-gold-dark transition flex items-center shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        Connect to Google Drive
                    </button>
                )}
                {error && <p className="text-red-600 mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default SettingsPage;
