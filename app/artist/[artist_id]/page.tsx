"use client";

import React, { useEffect, useState } from 'react';
import { fetchArtistById } from '@/services/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Album {
  aaid: string; // Now actually returned by the backend
  title: string;
  albumCover: string | null;
}

interface ArtistProfile {
  name: string;
  profileImageUrl: string;
  bio: string;
  albums: Album[];
}

const ArtistPage = () => {
  const { artist_id } = useParams();
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (artist_id) {
      const getArtistProfile = async () => {
        try {
          const data = await fetchArtistById(artist_id as string);
          if (data.error) {
            setError(data.error);
          } else {
            setArtistProfile({
              ...data.artist,
              albums: data.albums || [], // Ensure albums is always an array
            });
          }
        } catch (err: unknown) {
          // Avoid using `any` in the catch clause; safely derive a message
          const message = err instanceof Error ? err.message : 'Failed to fetch artist profile';
          setError(message);
        } finally {
          setLoading(false);
        }
      };
      getArtistProfile();
    }
  }, [artist_id]);

  if (loading) return <div className="text-white">Loading artist profile...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!artistProfile) return <div className="text-white">Artist not found.</div>;

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Image
          src={artistProfile.profileImageUrl || '/default-artist.png'}
          alt={artistProfile.name}
          width={128}
          height={128}
          className="w-32 h-32 rounded-full object-cover mr-6"
        />
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{artistProfile.name}</h1>
          <p className="text-gray-400">{artistProfile.bio}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artistProfile.albums.map((album) => (
          <div key={album.aaid} className="bg-gray-800 rounded-lg p-4 shadow-lg flex flex-col items-center">
            <Image
              src={album.albumCover || '/default-album.png'}
              alt={album.title}
              width={128}
              height={128}
              className="w-32 h-32 rounded-md object-cover mb-4"
            />
            <Link href={`/artist/${artist_id}/${album.aaid}`} className="text-xl font-semibold text-white hover:text-blue-400">
              {album.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistPage;
