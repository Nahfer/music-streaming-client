'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Menu } from 'lucide-react';

const HamburgerMenu: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAuthenticated(Boolean(localStorage.getItem('token')));
    }
  }, []);

  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/artists', label: 'Artists' },
    { href: '/discover', label: 'Discover' },
    { href: '/playlists', label: 'Playlists' },
  ];

  const authItems = isAuthenticated
    ? [{ href: '/profile', label: 'Profile' }]
    : [{ href: '/login', label: 'Login' }, { href: '/signup', label: 'Sign Up' }];

  const handleLinkClick = (href: string, onOpenChange?: (open: boolean) => void) => {
    if (onOpenChange) onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200" aria-label="Toggle menu">
          <Menu className="w-6 h-6 text-white" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed top-0 left-0 h-full w-64 bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="p-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <Dialog.Close asChild>
                <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200" aria-label="Close menu">
                  <X className="w-6 h-6 text-white" />
                </button>
              </Dialog.Close>
            </div>

            <nav className="space-y-2" aria-label="Mobile navigation">
              {navigationItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleLinkClick(item.href)}
                  className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200 flex items-center"
                >
                  {item.label}
                </button>
              ))}

              {authItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleLinkClick(item.href)}
                  className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200 flex items-center"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default HamburgerMenu;