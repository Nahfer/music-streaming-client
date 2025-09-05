"use client";

import React, { useEffect, useState } from 'react';
import { fetchUserProfile } from '@/services/api';
import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';

interface UserAlbum {
  aaid: string;
  title: string;
  albumCover: string | null;
}

interface UserProfile {
  aid: string;
  email: string;
  name: string;
  gender: string;
  type: string;
  bio: string;
  profileImageUrl: string | null;
  albums: UserAlbum[];
}

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchUserProfile();
        if (data.error) {
          setError(typeof data.error === 'object' ? JSON.stringify(data.error) : data.error);
        } else {
          setUserProfile(data.profile);
        }
      } catch {
        const message = 'Failed to fetch profile';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  // Sign out is handled by the header replacement and the ProfileDropdown; no button in the profile card

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️ Error loading profile</div>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-gray-400">Profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400 text-lg">Manage your account and view your music</p>
      </div>

      {/* Profile Info Card */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex-shrink-0">
              <Avatar
                src={userProfile.profileImageUrl || undefined}
                alt={userProfile.name}
                fallback={userProfile.name.charAt(0).toUpperCase()}
                size="xl"
                className="ring-2 ring-gray-700"
              />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{userProfile.name}</h2>
              <div className="space-y-1 text-gray-400">
                <p>📧 {userProfile.email}</p>
                <p>🎭 {userProfile.type}</p>
                {userProfile.bio && <p>📝 {userProfile.bio}</p>}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Albums Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-6">My Albums</h2>

        {userProfile.albums.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No albums yet</h3>
            <p className="text-gray-400">Your uploaded albums will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {userProfile.albums.map((album) => (
              <Card key={album.aaid} hover className="group overflow-hidden">
                <Link href={`/artist/${userProfile.aid}/${album.aaid}`} className="block">
                  <div className="w-full aspect-square rounded-xl overflow-hidden relative group-hover:scale-105 transition-transform duration-200">
                    <Image
                      src={album.albumCover || '/default-album.png'}
                      alt={album.title}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  </div>

                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors duration-200 truncate">
                      {album.title}
                    </h3>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
