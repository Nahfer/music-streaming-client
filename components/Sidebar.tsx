'use client';

import React, { useEffect, useState, type ReactElement } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const check = () => setIsAuthenticated(typeof window !== 'undefined' && Boolean(localStorage.getItem('token')));
    check();
    const onAuth = () => check();
    const onStorage = (e: StorageEvent) => { if (e.key === 'token') check(); };
    window.addEventListener('auth-changed', onAuth);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('auth-changed', onAuth);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const navigationItems: Array<{ href: string; label: string; icon: ReactElement }> = [
    {
      href: '/',
      label: 'Home',
      icon: (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z"
            stroke="currentColor"
            strokeWidth="0"
            fill="currentColor"
            opacity="0.95"
          />
        </svg>
      ),
    },
    {
      href: '/artists',
      label: 'Artists',
      icon: (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0H4z"
            stroke="currentColor"
            strokeWidth="0"
            fill="currentColor"
            opacity="0.95"
          />
        </svg>
      ),
    },
    {
      href: '/discover',
      label: 'Discover',
      icon: (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M21 21l-4.35-4.35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="11"
            cy="11"
            r="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      href: '/playlists',
      label: 'Playlists',
      icon: (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 6h14M3 10h14M3 14h10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="19"
            cy="15"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  // Hide sidebar entirely for unauthenticated users
  if (!isAuthenticated) return null;

  return (
    <aside className="w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-[--panel] text-accent ring-1 ring-accent/20 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-accent' : 'text-gray-300'}`}>
                  {item.icon}
                </span>
                <span className={`font-medium ${isActive ? 'text-accent' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
