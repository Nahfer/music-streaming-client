'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { fetchUserProfile } from '@/services/api';
import { UserPlus } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Refresh auth state and username, trying to fetch profile when token present
  const refreshAuth = async () => {
    if (typeof window === 'undefined') return;
    const tokenPresent = Boolean(localStorage.getItem('token'));
    setIsAuthenticated(tokenPresent);

    if (!tokenPresent) {
      setUsername(null);
      return;
    }

    try {
      const profileData = await fetchUserProfile();
      // backend returns { profile: { ... } }
      if (profileData?.profile) {
        const p = profileData.profile;
        // Do not fall back to email for the displayed username — use name only
        setUsername(p.name ?? null);
        return;
      }
      // some older endpoints might return user
      if (profileData?.user) {
        setUsername(profileData.user.username ?? profileData.user.name ?? null);
        return;
      }
    } catch {
      // If profile fetch fails, fall back to localStorage keys
    }

    // Fallback: inspect common localStorage keys
    const nameKeys = ['username', 'userName', 'name', 'displayName', 'user'];
    let found: string | null = null;
    for (const k of nameKeys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      if (raw.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.name) { found = String(parsed.name); break; }
          if (parsed?.username) { found = String(parsed.username); break; }
          if (parsed?.displayName) { found = String(parsed.displayName); break; }
        } catch {
          // ignore
        }
      } else {
        found = raw;
        break;
      }
    }
    setUsername(found);
  };

  useEffect(() => {
    refreshAuth();
    const onAuth = () => refreshAuth();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') refreshAuth();
    };
    window.addEventListener('auth-changed', onAuth);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('auth-changed', onAuth);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Use images placed under public/assets/ — drop your attached images there with the names below
  const features = [
    {
      title: 'Discover Music',
      description: 'Explore thousands of songs across different genres',
      href: '/discover',
      image: '/assets/home-discover.png',
    },
    {
      title: 'Explore Artists',
      description: 'Find your favorite artists and discover new ones',
      href: '/artists',
      image: '/assets/home-artists.png',
    },
    {
      title: 'My Playlists',
      description: 'Create and manage your personal music collections',
      href: '/playlists',
      image: '/assets/home-playlists.png',
    }
  ];

  const handleCardClick = useCallback((href: string, e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push('/login');
      return;
    }
    // otherwise allow Link navigation to proceed naturally
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-16 lg:py-24">
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
          Welcome,
          <span className="ml-2 text-emerald-600 font-semibold">{username ?? (isAuthenticated ? 'User' : 'Guest')}</span>
        </h1>
        <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Discover and stream music.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Show Create Account only when NOT authenticated */}
          {!isAuthenticated && (
            <Button variant="outline" size="lg">
              <Link href="/signup" className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Create Account</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
        {features.map((feature, index) => (
          <Card key={index} hover className="group cursor-pointer overflow-hidden">
            <Link href={feature.href} className="block" onClick={(e) => handleCardClick(feature.href, e)}>
              <div className="relative w-full h-48 sm:h-56 md:h-48 lg:h-56 xl:h-64 overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Dark gradient overlay so text is readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                {/* Text overlays on image */}
                <div className="absolute bottom-0 left-0 w-full p-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-teal-400 transition-colors duration-200 truncate">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-200 opacity-90 line-clamp-2">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      {/* Removed the Call to Action section per request */}
    </div>
  );
}
