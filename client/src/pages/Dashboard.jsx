import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Logo from '../assets/Logo.svg';

export default function Dashboard() {
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const name = searchParams.get('name');

        if (token && email) {
            // Store token in localStorage for future API calls
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ email, name }));
            
            setUser({ email, name });
            setLoading(false);
        } else {
            // No token, redirect to login
            window.location.href = '/login';
        }
    }, [searchParams]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={Logo} alt="Logo" className="h-8 w-8" />
                        <h1 className="text-white text-xl font-bold">MURAi Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-neutral-300">Welcome, {user?.name || user?.email}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-neutral-100 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Welcome to MURAi!</h2>
                        <p className="text-neutral-300 mb-6">
                            You have successfully logged in with Google. Your account is now active and ready to use.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                                <h3 className="text-white font-semibold mb-2">Account Information</h3>
                                <p className="text-neutral-300 text-sm">Email: {user?.email}</p>
                                <p className="text-neutral-300 text-sm">Name: {user?.name}</p>
                            </div>
                            
                            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                                <h3 className="text-white font-semibold mb-2">Authentication Status</h3>
                                <p className="text-green-400 text-sm">✓ Successfully authenticated with Google</p>
                                <p className="text-green-400 text-sm">✓ Token stored securely</p>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-900 border border-blue-700 rounded-lg">
                            <h3 className="text-blue-200 font-semibold mb-2">Next Steps</h3>
                            <p className="text-blue-100 text-sm">
                                You can now access all features of the application. Your authentication token is stored 
                                and will be used for API requests. You can log out at any time using the button in the header.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 