"use client";

import React, { useEffect, useState } from 'react';
import { fetchArtists } from '@/services/api';
import Link from 'next/link';
import Image from 'next/image';

interface Artist {
  aid: string; // Now actually returned by the backend
  name: string;
  profileImageUrl?: string | null;
}

const ArtistsPage = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getArtists = async () => {
      try {
        const data = await fetchArtists(searchQuery);
        if (data.error) {
          setError(data.error);
        } else {
          setArtists(data.artistList);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || 'Failed to fetch artists');
      } finally {
        setLoading(false);
      }
    };
    getArtists();
  }, [searchQuery]);

  if (loading) return <div className="text-white">Loading artists...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-white">Artists</h1>
      <input
        type="text"
        placeholder="Search artists..."
        className="p-2 rounded bg-gray-700 text-white mb-4 w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artists.map((artist) => (
          <div key={artist.aid} className="bg-gray-800 rounded-lg p-4 shadow-lg flex flex-col items-center">
            <div className="w-32 h-32 rounded-full object-cover mb-4 relative overflow-hidden">
              <Image
                src={artist.profileImageUrl || '/default-artist.png'}
                alt={artist.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <Link href={`/artist/${artist.aid}`} className="text-xl font-semibold text-white hover:text-blue-400">{artist.name}</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistsPage;
