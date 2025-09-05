'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
          <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div
            className="fixed top-0 left-0 h-full w-64 bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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
          </div>
        </div>
      )}
    </>
  );
};

export default HamburgerMenu;