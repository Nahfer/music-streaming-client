"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchTracksByGenre } from '@/services/api';
import { useParams } from 'next/navigation';
import Player from '@/components/Player';

interface Track {
  tid: string; // Now actually returned by the backend
  title: string;
  artist: { name: string };
  duration: number;
  genre: { genre: string };
  lyrics: string;
  hostedDirectoryUrl: string;
  album?: { aaid?: string; albumCover?: string | null };
}

const GenrePage = () => {
  const { genre_id } = useParams();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (genre_id) {
      console.log("Genre ID from useParams:", genre_id);
      const getTracksByGenre = async () => {
        try {
          const data = await fetchTracksByGenre(genre_id as string, searchQuery);
          if (data.error) {
            setError(typeof data.error === 'object' ? JSON.stringify(data.error) : data.error);
          } else {
            setTracks(data.trackList || []);
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message || 'Failed to fetch tracks by genre');
        } finally {
          setLoading(false);
        }
      };
      getTracksByGenre();
    }
  }, [genre_id, searchQuery]);

  const handleTrackClick = (track: Track) => {
    setCurrentTrack(track);
  };

  if (loading) return <div className="text-white">Loading tracks...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (tracks.length === 0) return <div className="text-white">No tracks found for this genre.</div>;

  // Derive genre name from the fetched tracks when possible
  const genreName = tracks[0]?.genre?.genre ?? genre_id;

  return (
    <div className="p-4 pb-32"> {/* Added padding-bottom to account for player */}
      <h1 className="text-3xl font-bold mb-6 text-white">Tracks in {genreName}</h1>
      <input
        type="text"
        placeholder="Search tracks..."
        className="p-2 rounded bg-gray-700 text-white mb-4 w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="grid grid-cols-1 gap-4">
        {tracks.map((track) => (
          <div
            key={track.tid}
            className="bg-gray-800 rounded-lg p-4 shadow-lg flex items-center justify-between cursor-pointer hover:bg-gray-700"
            onClick={() => handleTrackClick(track)}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 relative flex-shrink-0">
                <Image
                  src={track.album?.albumCover ?? '/default-album.png'}
                  alt={track.title}
                  fill
                  className="object-cover rounded-md"
                  sizes="64px"
                />
              </div>
              <div>
                <p className="text-xl font-semibold text-white">{track.title}</p>
                <p className="text-gray-400">{track.artist.name} - {track.genre.genre}</p>
              </div>
            </div>
            <p className="text-gray-400">{track.duration}s</p>
          </div>
        ))}
      </div>
      <Player currentTrack={currentTrack ? { title: currentTrack.title, artistName: currentTrack.artist.name, audioUrl: currentTrack.hostedDirectoryUrl } : null} />
    </div>
  );
};

export default GenrePage;
