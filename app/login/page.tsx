"use client";

import React, { useState } from 'react';
import { login } from '@/services/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(email, password);
      if (data.error) {
        setError(data.error);
      } else {
        // Assuming the token is returned and needs to be stored
        localStorage.setItem('token', data.token);
        // Notify same-window listeners that auth changed (storage event doesn't fire in same window)
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth-changed'));
        router.push('/'); // Redirect to home page
      }
    } catch {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[--background]">
      <div className="bg-[--panel] p-8 rounded-2xl shadow-lg w-96 border border-[--panel-border]">
        <h1 className="text-2xl font-semibold mb-4 text-white">Login</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="w-full bg-transparent border border-gray-700 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              className="w-full bg-transparent border border-gray-700 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col items-center gap-3">
            <button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-black font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-accent w-full text-sm"
            >
              Sign In
            </button>
            <Link href="/signup" className="text-accent text-sm hover:underline">
              Don&apos;t have an account? Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
