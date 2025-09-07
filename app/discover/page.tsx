"use client";

import React, { useEffect, useState } from 'react';
import { fetchGenres } from '@/services/api';
import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

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

  if (loading) return <Loading message="Loading genres..." />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️ Error loading genres</div>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Discover Genres</h1>
        <p className="text-gray-400 text-lg">Explore music across different genres and find your next favorite</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {genres.map((genre) => (
          <Card key={genre.gid} hover className="group overflow-hidden">
            <Link href={`/discover/${genre.gid}`} className="block">
              {/* Full-width square image that matches playlist hover effects */}
              <div className="w-full aspect-square rounded-xl overflow-hidden relative transition-transform duration-200 group-hover:scale-105 ring-0 group-hover:ring-2 group-hover:ring-teal-500 group-hover:ring-offset-2 group-hover:ring-offset-gray-900">
                <Image
                  src={genre.genreCoverUrl || '/default-genre.png'}
                  alt={genre.genre}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>

              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors duration-200">
                  {genre.genre}
                </h3>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DiscoverPage;
