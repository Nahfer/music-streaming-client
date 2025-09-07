'use client';

import React, { useEffect, useState, type ReactElement } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Search, List } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

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
    { href: '/', label: 'Home', icon: <Home className="w-6 h-6" /> },
    { href: '/artists', label: 'Artists', icon: <Users className="w-6 h-6" /> },
    { href: '/discover', label: 'Discover', icon: <Search className="w-6 h-6" /> },
    { href: '/playlists', label: 'Playlists', icon: <List className="w-6 h-6" /> },
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
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <span className={`flex-shrink-0 ${isActive ? 'text-accent' : 'text-gray-300'}`}>
                        {item.icon}
                      </span>
                    </Tooltip.Trigger>
                    <Tooltip.Content side="right" className="bg-gray-800 text-white px-2 py-1 rounded text-sm shadow-md">
                      {item.label}
                      <Tooltip.Arrow className="fill-current text-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>

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
