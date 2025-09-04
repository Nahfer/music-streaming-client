"use client";

import React, { useEffect, useState } from 'react';
import { fetchUserProfile } from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UserAlbum {
  aaid: string; // Album ID
  title: string;
  albumCover: string | null;
}

interface UserProfile {
  aid: string; // Artist ID
  email: string;
  name: string;
  gender: string;
  type: string;
  bio: string;
  profileImageUrl: string | null;
  albums: UserAlbum[];
}

const ProfilePage = () => {
  const router = useRouter();
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

  const signOut = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    } catch {
      // ignore
    }
    // send the user to the login page
    router.push('/login');
  };

  if (loading) return <div className="text-white">Loading profile...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!userProfile) return <div className="text-white">Profile not found.</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold mb-6 text-white">My Profile</h1>
        <button
          onClick={signOut}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden mr-6 relative">
            <Image
              src={userProfile.profileImageUrl || '/default-user.png'}
              alt={userProfile.name}
              fill
              className="object-cover"
              style={{ objectPosition: 'center' }}
            />
          </div>
          <div>
            <p className="text-2xl font-semibold text-white">{userProfile.name}</p>
            <p className="text-gray-400">{userProfile.email}</p>
            <p className="text-gray-400">{userProfile.type}</p>
          </div>
        </div>
        <p className="text-gray-300">{userProfile.bio}</p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">My Albums</h2>
      {userProfile.albums.length === 0 ? (
        <p className="text-gray-400">No albums uploaded.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
          {userProfile.albums.map((album) => (
            <div key={album.aaid} className="bg-gray-800 rounded-lg p-4 shadow-lg flex flex-col items-center">
              <div className="w-32 h-32 rounded-md overflow-hidden mb-4">
                <Image
                  src={album.albumCover || '/default-album.png'}
                  alt={album.title}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <Link href={`/artist/${userProfile.aid}/${album.aaid}`} className="text-xl font-semibold text-white hover:text-blue-400">
                {album.title}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
