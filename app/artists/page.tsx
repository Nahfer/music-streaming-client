"use client";

import React, { useEffect, useState } from 'react';
import { fetchArtists } from '@/services/api';
import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';

interface Artist {
  aid: string;
  name: string;
  profileImageUrl?: string | null;
}

const ArtistsPage = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getArtists = async () => {
      try {
        const data = await fetchArtists();
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading artists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️ Error loading artists</div>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Artists</h1>
        <p className="text-gray-400 text-lg">Discover and explore your favorite artists</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {artists.map((artist) => (
          <Card key={artist.aid} hover className="group overflow-hidden">
            <Link href={`/artist/${artist.aid}`} className="block">
              {/* Full-width square area with a centered circular image */}
              <div className="w-full aspect-square rounded-xl overflow-hidden relative flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <div className="w-3/4 aspect-square rounded-full overflow-hidden relative">
                  <Image
                    src={artist.profileImageUrl || '/default-artist.png'}
                    alt={artist.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                </div>
              </div>

              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors duration-200 truncate">
                  {artist.name}
                </h3>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      {artists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No artists found</p>
        </div>
      )}
    </div>
  );
};

export default ArtistsPage;
