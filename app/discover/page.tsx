"use client";

import React, { useEffect, useState } from 'react';
import { fetchGenres } from '@/services/api';
import Link from 'next/link';
import Image from 'next/image';

interface Genre {
  gid: string; // Now actually returned by the backend
  genre: string;
  genreCoverUrl?: string | null;
}

const DiscoverPage = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getGenres = async () => {
      try {
        const data = await fetchGenres();
        if (data.error) {
          setError(data.error);
        } else {
          setGenres(data.genreList);
          console.log("Fetched genres with IDs:", data.genreList);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || 'Failed to fetch genres');
      } finally {
        setLoading(false);
      }
    };
    getGenres();
  }, []);

  if (loading) return <div className="text-white">Loading genres...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-white">Discover Genres</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {genres.map((genre) => (
          <div key={genre.gid} className="bg-gray-800 rounded-lg p-4 shadow-lg flex flex-col items-center">
            <div className="w-32 h-32 rounded-md overflow-hidden mb-4 relative">
              <Image src={genre.genreCoverUrl || '/default-genre.png'} alt={genre.genre} fill className="object-cover" sizes="128px" />
            </div>
            <Link href={`/discover/${genre.gid}`} className="text-xl font-semibold text-white hover:text-blue-400">{genre.genre}</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverPage;
