import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Logo from '../assets/Logo.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CompleteProfile() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const firstNameParam = searchParams.get('firstName') || '';
  const lastNameParam = searchParams.get('lastName') || '';
  const [form, setForm] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(f => ({
      ...f,
      firstName: firstNameParam,
      lastName: lastNameParam
    }));
  }, [firstNameParam, lastNameParam]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...form })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Profile completed! Redirecting to dashboard...');
        // Store token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        // Redirect to client dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/client/dashboard';
        }, 2000);
      } else {
        setError(data.message || 'Profile completion failed');
      }
    } catch {
      setError('Profile completion failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black">
      {/* Left: Form card */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-black py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg space-y-6 flex flex-col items-center"
        >
          <img src={Logo} alt="Logo" className="h-10 w-10 mb-4" />
          <h2 className="text-3xl font-bold text-white mb-1 text-center">Complete Your Profile</h2>
          <p className="text-neutral-300 text-center mb-6">Just a few more details to finish setting up your account.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white">First Name</Label>
              <Input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="First Name"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:border-white focus:ring-white"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:border-white focus:ring-white"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-white">Gender</Label>
              <select
                id="gender"
                name="gender"
                className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                name="dateOfBirth"
                className="bg-neutral-800 border-neutral-700 text-white focus:border-white focus:ring-white"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:border-white focus:ring-white"
              value={form.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="text"
              value={email || ''}
              disabled
              className="bg-neutral-800 border-neutral-700 text-neutral-400 focus:border-white focus:ring-white"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-neutral-100 text-lg py-3 rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </Button>
          {error && <div className="text-red-500 text-center text-sm mt-2">{error}</div>}
          {success && <div className="text-green-600 text-center text-sm mt-2">{success}</div>}
        </form>
      </div>
      {/* Right: Welcome panel */}
      <div className="hidden md:flex w-1/2 bg-black items-center justify-center border-l border-neutral-800">
        <div className="text-white text-4xl font-extrabold text-center px-12 leading-tight">
          Welcome!<br />
          <span className="text-neutral-400 text-lg font-normal block mt-4">Complete your profile to get started with your personalized experience.</span>
        </div>
      </div>
    </div>
  );
} 