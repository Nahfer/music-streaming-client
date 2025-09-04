"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchAlbumTracks } from '@/services/api';
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

const AlbumPage = () => {
  const { artist_id, album_id } = useParams();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (artist_id && album_id) {
      const getAlbumTracks = async () => {
        try {
          const data = await fetchAlbumTracks(artist_id as string, album_id as string, searchQuery);
          if (data.error) {
            setError(data.error);
          } else {
            setTracks(data.trackList);
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message || 'Failed to fetch album tracks');
        } finally {
          setLoading(false);
        }
      };
      getAlbumTracks();
    }
  }, [artist_id, album_id, searchQuery]);

  const handleTrackClick = (track: Track) => {
    setCurrentTrack(track);
  };

  if (loading) return <div className="text-white">Loading album tracks...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (tracks.length === 0) return <div className="text-white">No tracks found for this album.</div>;

  return (
    <div className="p-4 pb-32"> {/* Added padding-bottom to account for player */}
      <h1 className="text-3xl font-bold mb-6 text-white">Album Tracks</h1>
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
                {(() => {
                  const src = track.album?.albumCover ?? '/default-album.png';
                  const isExternal = typeof src === 'string' && /^https?:\/\//i.test(src);
                  if (isExternal) {
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img src={src} alt={track.title} className="object-cover rounded-md w-16 h-16" />;
                  }
                  return <Image src={src} alt={track.title} fill className="object-cover rounded-md" sizes="64px" />;
                })()}
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

export default AlbumPage;
