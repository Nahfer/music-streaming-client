'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from './ui/Avatar';
import { fetchUserProfile } from '@/services/api';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { User, LogOut, LogIn, UserPlus } from 'lucide-react';

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

  return (
    <div ref={dropdownRef} className="relative flex items-center">
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <button
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
        </DropdownMenu.Trigger>

        <DropdownMenu.Content className="mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50" sideOffset={8} align="end">
          {user ? (
            <div>
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
                <DropdownMenu.Item asChild>
                  <button
                    onClick={() => { setIsOpen(false); handleProfileClick(); }}
                    className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  >
                    <User className="w-5 h-5 mr-3 text-gray-300" />
                    View Profile
                  </button>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                  <button
                    onClick={() => { setIsOpen(false); handleSignOut(); }}
                    className="w-full px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  >
                    <LogOut className="w-5 h-5 mr-3 text-red-400" />
                    Sign Out
                  </button>
                </DropdownMenu.Item>
              </div>
            </div>
          ) : (
            <div>
              <div className="p-3 border-b border-gray-700">
                <div className="text-white font-medium">Welcome</div>
                <div className="text-gray-400 text-sm">Sign in or create an account</div>
              </div>

              <div className="py-2">
                <DropdownMenu.Item asChild>
                  <button
                    onClick={() => { setIsOpen(false); router.push('/login'); }}
                    className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  >
                    <LogIn className="w-5 h-5 mr-3 text-gray-300" />
                    Login
                  </button>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                  <button
                    onClick={() => { setIsOpen(false); router.push('/signup'); }}
                    className="w-full px-4 py-3 text-left bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200 flex items-center"
                  >
                    <UserPlus className="w-5 h-5 mr-3 text-white" />
                    Sign Up
                  </button>
                </DropdownMenu.Item>
              </div>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

export default ProfileDropdown;