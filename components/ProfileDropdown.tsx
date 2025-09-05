'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from './ui/Avatar';
import { fetchUserProfile } from '@/services/api';

interface User {
  uid: string;
  username: string;
  email: string;
  profilePictureUrl?: string | null;
}

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          setUser(null);
          return;
        }

        const profileData = await fetchUserProfile();
        // Support new `{ profile: { ... } }` and legacy `{ user: { ... } }` shapes
        if (profileData?.profile) {
          const p = profileData.profile;
          setUser({
            uid: p.aid ?? p.id ?? '',
            username: p.name ?? p.username ?? '',
            email: p.email ?? '',
            profilePictureUrl: p.profileImageUrl ?? null,
          });
        } else if (profileData?.user) {
          const u = profileData.user;
          setUser({
            uid: u.uid ?? u.id ?? '',
            username: u.username ?? u.name ?? '',
            email: u.email ?? '',
            profilePictureUrl: u.profilePictureUrl ?? u.avatar ?? null,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();

    const onAuthChanged = () => loadUserProfile();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') loadUserProfile();
    };

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
    }
    setUser(null);
    setIsOpen(false);
    // Notify other components that auth changed (helps pages like Home update)
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth-changed'));
    router.push('/login');
  };

  const handleProfileClick = () => {
    // Direct navigation to profile when user is present.
    setIsOpen(false);
    router.push('/profile');
  };

  if (isLoading) {
    return (
      <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse" aria-hidden="true"></div>
    );
  }

  // Unified profile button: shows a dropdown whether logged in or not.
  return (
    <div ref={dropdownRef} className="relative flex items-center">
      {/* When logged in, clicking the avatar goes straight to profile. The chevron toggles the menu. */}
      <button
        onClick={async () => {
          if (user) return router.push('/profile');
          // If token exists but user not loaded yet, try to load then go to profile
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (token) {
            setIsLoading(true);
            try {
              const profileData = await fetchUserProfile();
              if (profileData?.profile) {
                const p = profileData.profile;
                setUser({
                  uid: p.aid ?? p.id ?? '',
                  username: p.name ?? p.username ?? '',
                  email: p.email ?? '',
                  profilePictureUrl: p.profileImageUrl ?? null,
                });
                router.push('/profile');
                return;
              }
              if (profileData?.user) {
                const u = profileData.user;
                setUser({
                  uid: u.uid ?? u.id ?? '',
                  username: u.username ?? u.name ?? '',
                  email: u.email ?? '',
                  profilePictureUrl: u.profilePictureUrl ?? u.avatar ?? null,
                });
                router.push('/profile');
                return;
              }
            } catch (err) {
              console.error('Failed to load profile on avatar click', err);
            } finally {
              setIsLoading(false);
            }
          }
          setIsOpen((s) => !s);
        }}
        className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
        aria-label="Profile"
      >
        <Avatar
          src={user?.profilePictureUrl ?? undefined}
          alt={user?.username ?? 'Account'}
          fallback={user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          size="md"
        />
      </button>

      <button
        onClick={() => setIsOpen((s) => !s)}
        aria-label="Open account menu"
        className={`ml-1 p-1 rounded ${isOpen ? 'bg-gray-700' : 'hover:bg-gray-700'} transition-colors duration-200`}
      >
        <svg className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50" role="menu" aria-orientation="vertical">
          {user ? (
            <>
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={user.profilePictureUrl ?? undefined}
                    alt={user.username}
                    fallback={user.username.charAt(0).toUpperCase()}
                    size="md"
                  />
                  <div>
                    <div className="text-white font-medium">{user.username}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <button
                  onClick={() => { setIsOpen(false); handleProfileClick(); }}
                  className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  role="menuitem"
                >
                  <svg className="w-5 h-5 mr-3 text-gray-300" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.2" opacity="0.95" />
                    <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6v1H4v-1z" opacity="0.95" />
                  </svg>
                  View Profile
                </button>

                <button
                  onClick={() => { setIsOpen(false); handleSignOut(); }}
                  className="w-full px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  role="menuitem"
                >
                  <svg className="w-5 h-5 mr-3 text-red-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M10 17l5-5-5-5v10z" opacity="0.95" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 border-b border-gray-700">
                <div className="text-white font-medium">Welcome</div>
                <div className="text-gray-400 text-sm">Sign in or create an account</div>
              </div>

              <div className="py-2">
                <button
                  onClick={() => { setIsOpen(false); router.push('/login'); }}
                  className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  role="menuitem"
                >
                  <svg className="w-5 h-5 mr-3 text-gray-300" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 2a9 9 0 100 18 9 9 0 000-18zm0 5v5l3 2" opacity="0.95" />
                  </svg>
                  Login
                </button>

                <button
                  onClick={() => { setIsOpen(false); router.push('/signup'); }}
                  className="w-full px-4 py-3 text-left bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200 flex items-center"
                  role="menuitem"
                >
                  <svg className="w-5 h-5 mr-3 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 4v16m8-8H4" opacity="0.95" />
                  </svg>
                  Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;