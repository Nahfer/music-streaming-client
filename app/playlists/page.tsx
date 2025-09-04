"use client";

import React, { useEffect, useState } from 'react';
import { fetchUserPlaylists } from '@/services/api';
import CreatePlaylist from '@/components/CreatePlaylist';
import Link from 'next/link';

interface TrackInPlaylist {
  tid: string; // Ensure tid is included for tracks within a playlist
  title: string;
  artist: { name: string };
  genre: { genre: string };
  duration: number;
  hostedDirectoryUrl: string;
}

interface Playlist {
  pid: string; // Ensure pid is included for the playlist itself
  playlistTitle: string;
  tracks: TrackInPlaylist[];
  trackCount: number;
}

// Type describing the API response shape for playlists
interface ApiPlaylistsResponse {
  error?: string | string[] | Record<string, unknown>;
  playlists?: Playlist[];
}

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getUserPlaylists = async () => {
    try {
      const data = (await fetchUserPlaylists()) as ApiPlaylistsResponse;
      if (data && data.error) {
        const e = data.error;
        setError(typeof e === 'object' ? JSON.stringify(e) : String(e));
      } else {
        setPlaylists(data.playlists || []);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserPlaylists();
  }, []);

  if (loading) return <div className="text-white">Loading playlists...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">My Playlists</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showCreateForm ? 'Cancel' : 'Create New Playlist'}
        </button>
      </div>

      {showCreateForm && (
        <CreatePlaylist onCreated={() => { setShowCreateForm(false); getUserPlaylists(); }} />
      )}

      {playlists.length === 0 ? (
        <div className="text-white">No playlists found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.pid} className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <Link href={`/playlists/${playlist.pid}`} className="text-xl font-semibold text-white hover:text-blue-400">{playlist.playlistTitle}</Link>
              <p className="text-gray-400">{playlist.trackCount} tracks</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
