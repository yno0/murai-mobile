import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Logo from '../assets/Logo.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Check for authentication errors from Google OAuth
    useEffect(() => {
        const authError = searchParams.get('error');
        if (authError === 'authentication_failed') {
            setError('Google authentication failed. Please try again.');
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        
        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            
            if (res.ok) {
                setSuccess('Login successful!');
                // Redirect to dashboard or home page
                // window.location.href = '/dashboard';
            } else {
                setError(data.message || 'Login failed');
            }
        } catch {
            setError('Login failed');
        }
        setLoading(false);
    };

    const handleGoogleAuth = () => {
        window.location.href = 'http://localhost:3000/api/auth/google';
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-black">
            {/* Left: Form */}
            <div className="flex flex-col justify-center w-full md:w-1/2 bg-black px-8">
                <div className="max-w-md w-full mx-auto">
                    <div className="flex items-center gap-2 mb-8 mt-8">
                        <img src={Logo} alt="Logo" className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-neutral-300 mb-8">Sign in to your account to continue.</p>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:border-white focus:ring-white"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Password"
                                    className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:border-white focus:ring-white pr-10"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    className="rounded border-neutral-700 bg-neutral-800 text-white focus:ring-white"
                                />
                                <span className="text-sm text-neutral-300">Remember me</span>
                            </label>
                            <a href="/forgot-password" className="text-sm text-white hover:text-neutral-300 underline">
                                Forgot password?
                            </a>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-white text-black hover:bg-neutral-100 text-lg py-3 rounded-xl font-semibold mt-2"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                        
                        {error && <div className="text-red-500 text-center text-sm mt-2">{error}</div>}
                        {success && <div className="text-green-600 text-center text-sm mt-2">{success}</div>}
                    </form>

                    <div className="flex items-center my-6">
                        <div className="flex-grow h-px bg-neutral-700" />
                        <span className="mx-4 text-neutral-400 text-sm">Or Sign In With</span>
                        <div className="flex-grow h-px bg-neutral-700" />
                    </div>

                    <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white py-3 rounded-xl font-semibold text-base"
                        onClick={handleGoogleAuth}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_17_40)">
                                <path d="M19.8052 10.2309C19.8052 9.5508 19.7491 8.86727 19.629 8.19824H10.2V12.0491H15.6263C15.3982 13.2851 14.6522 14.3662 13.6012 15.0483V17.3158H16.6832C18.4862 15.6618 19.8052 13.2218 19.8052 10.2309Z" fill="#4285F4"/>
                                <path d="M10.2 20C12.7001 20 14.7851 19.1819 16.6832 17.3158L13.6012 15.0483C12.5402 15.7583 11.2421 16.1663 10.2 16.1663C7.78391 16.1663 5.73585 14.4992 4.96582 12.3232H1.77881V14.6612C3.68785 17.9462 6.78391 20 10.2 20Z" fill="#34A853"/>
                                <path d="M4.96582 12.3232C4.76681 11.7872 4.6558 11.2152 4.6558 10.6242C4.6558 10.0332 4.76681 9.46119 4.96582 8.92519V6.58716H1.77881C1.14279 7.79917 0.800781 9.16419 0.800781 10.6242C0.800781 12.0842 1.14279 13.4492 1.77881 14.6612L4.96582 12.3232Z" fill="#FBBC05"/>
                                <path d="M10.2 5.08213C11.3491 5.08213 12.3891 5.47813 13.2172 6.27314L16.7442 3.00012C14.7851 1.2181 12.7001 0.248047 10.2 0.248047C6.78391 0.248047 3.68785 2.30109 1.77881 5.58612L4.96582 7.92414C5.73585 5.74812 7.78391 4.08213 10.2 4.08213V5.08213Z" fill="#EA4335"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_17_40">
                                    <rect width="19.0044" height="20" fill="white" transform="translate(0.800781)"/>
                                </clipPath>
                            </defs>
                        </svg>
                        Continue with Google
                    </Button>

                    <p className="text-center text-neutral-400 text-sm mt-6">
                        Don't have an account? <a href="/register" className="text-white underline hover:text-neutral-300">Sign up</a>
                    </p>

                    <div className="flex justify-between text-xs text-neutral-500 mt-8 mb-2">
                        <span>&copy; 2025 Sellora Enterprises LTD.</span>
                        <a href="#" className="hover:underline">Privacy Policy</a>
                    </div>
                </div>
            </div>

            {/* Right: Welcome panel */}
            <div className="hidden md:flex w-1/2 bg-black items-center justify-center border-l border-neutral-800">
                <div className="text-white text-4xl font-extrabold text-center px-12 leading-tight">
                    Welcome Back!<br />
                    <span className="text-neutral-400 text-lg font-normal block mt-4">Sign in to access your personalized dashboard and continue your journey.</span>
                </div>
            </div>
        </div>
    );
}