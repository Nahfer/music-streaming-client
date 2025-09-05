"use client";

import React, { useEffect, useState } from 'react';
import { fetchUserPlaylists } from '@/services/api';
import CreatePlaylist from '@/components/CreatePlaylist';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface TrackInPlaylist {
  tid: string;
  title: string;
  artist: { name: string };
  genre: { genre: string };
  duration: number;
  hostedDirectoryUrl: string;
}

interface Playlist {
  pid: string;
  playlistTitle: string;
  tracks: TrackInPlaylist[];
  trackCount: number;
}

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading playlists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️ Error loading playlists</div>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">My Playlists</h1>
          <p className="text-gray-400 text-lg">Create and manage your music collections</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
        >
          {showCreateForm ? 'Cancel' : '+ Create Playlist'}
        </Button>
      </div>

      {showCreateForm && (
        <div className="mb-8">
          <CreatePlaylist onCreated={() => { setShowCreateForm(false); getUserPlaylists(); }} />
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
          <p className="text-gray-400 mb-6">Create your first playlist to get started</p>
          {!showCreateForm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
            >
              Create Your First Playlist
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {playlists.map((playlist) => (
            <Card key={playlist.pid} hover className="group">
              <Link href={`/playlists/${playlist.pid}`} className="block p-6">
                <div className="w-full h-32 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 ring-0 group-hover:ring-2 group-hover:ring-teal-500 group-hover:ring-offset-2 group-hover:ring-offset-gray-900">
                  <svg className="w-12 h-12 text-gray-300 group-hover:text-accent transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-accent transition-colors duration-200 truncate mb-2">
                  {playlist.playlistTitle}
                </h3>
                <p className="text-gray-400 text-sm">
                  {playlist.trackCount} {playlist.trackCount === 1 ? 'track' : 'tracks'}
                </p>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
