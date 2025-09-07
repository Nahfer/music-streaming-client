'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SearchBar from './SearchBar';
import { User, Music } from 'lucide-react';

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(typeof window !== 'undefined' && Boolean(localStorage.getItem('token')));
    checkAuth();

    const onAuthChanged = () => checkAuth();
    const onStorage = (e: StorageEvent) => { if (e.key === 'token') checkAuth(); };

    window.addEventListener('auth-changed', onAuthChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('auth-changed', onAuthChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-changed'));
    }
    router.push('/');
  };

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-6 py-3 sticky top-0 z-40">
      <div className="w-full flex items-center relative">
        {/* Left - App name (increased left padding) */}
        <div className="flex items-center pl-4">
          <button onClick={() => router.push('/')} className="flex items-center text-lg font-bold text-white">
            <Music className="w-6 h-6 mr-2" strokeWidth={1.8} color="#14b8a6" aria-hidden />
            Music Stream
          </button>
        </div>

        {/* Center - absolutely centered Search Bar */}
        <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-full max-w-xl px-2 pointer-events-auto">
            <SearchBar />
          </div>
        </div>

        {/* Right - Login/Signup or Profile Icon */}
        <div className="flex items-center ml-auto pr-4">
          {isAuthenticated ? (
            // If on profile page, replace the profile icon with a red Sign Out button (intentional design)
            pathname === '/profile' ? (
              <button onClick={handleSignOut} aria-label="Sign Out" className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200">
                Sign Out
              </button>
            ) : (
              // Show profile icon on other pages
              <button onClick={() => router.push('/profile')} aria-label="Profile" className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
                <User className="w-8 h-8 text-gray-300" />
              </button>
            )
          ) : (
            <div className="flex items-center space-x-2">
              <button onClick={() => router.push('/login')} className="px-3 py-1 text-gray-300 hover:text-white transition-colors duration-200">
                Login
              </button>
              <button onClick={() => router.push('/signup')} className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
