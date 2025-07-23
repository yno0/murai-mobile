import React from 'react';
    import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Logo from '../../assets/Logo.svg';

export default function AdminLogin() {
    const [form, setForm] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // No real auth, just redirect
        setTimeout(() => {
            window.location.href = '/admin/dashboard';
        }, 500);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-black">
            {/* Left: Form */}
            <div className="flex flex-col justify-center w-full md:w-1/2 bg-black px-8">
                <div className="max-w-md w-full mx-auto">
                    <div className="flex items-center gap-2 mb-8 mt-8">
                        <img src={Logo} alt="Logo" className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
                    <p className="text-neutral-300 mb-8">Sign in as admin to access the admin dashboard.</p>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Admin Email"
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
                        <Button
                            type="submit"
                            className="w-full bg-white text-black hover:bg-neutral-100 text-lg py-3 rounded-xl font-semibold mt-2"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In as Admin'}
                        </Button>
                        {error && <div className="text-red-500 text-center text-sm mt-2">{error}</div>}
                    </form>
                </div>
            </div>
            {/* Right: Welcome panel */}
            <div className="hidden md:flex w-1/2 bg-black items-center justify-center border-l border-neutral-800">
                <div className="text-white text-4xl font-extrabold text-center px-12 leading-tight">
                    Admin Portal<br />
                    <span className="text-neutral-400 text-lg font-normal block mt-4">Sign in to manage the application as an administrator.</span>
                </div>
            </div>
        </div>
    );
} 