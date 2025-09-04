"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchPlaylistById, deletePlaylist } from '@/services/api';
import { useParams, useRouter } from 'next/navigation';
import Player from '@/components/Player';

interface Track {
  tid: string; // Ensure tid is included for tracks within a playlist
  title: string;
  duration: number;
  artist: { name: string };
  genre: { genre: string };
  hostedDirectoryUrl: string;
  album?: { aaid?: string; albumCover?: string | null };
}

interface Playlist {
  pid: string; // Ensure pid is included for the playlist itself
  playlistTitle: string;
  tracks: Track[];
  trackCount: number;
}

const PlaylistDetailPage = () => {
  const { playlist_id } = useParams();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  useEffect(() => {
    if (playlist_id) {
      const getPlaylistDetails = async () => {
        try {
          const data = await fetchPlaylistById(playlist_id as string);
          if (data.error) {
            setError(typeof data.error === 'object' ? JSON.stringify(data.error) : data.error);
          } else {
            setPlaylist(data.playlist);
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message || 'Failed to fetch playlist details');
        } finally {
          setLoading(false);
        }
      };
      getPlaylistDetails();
    }
  }, [playlist_id]);

  const handleTrackClick = (track: Track) => {
    setCurrentTrack(track);
  };

  const handleDeletePlaylist = async () => {
    if (playlist_id && window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await deletePlaylist(playlist_id as string);
        alert('Playlist deleted successfully!');
        router.push('/playlists'); // Redirect to playlists page after deletion
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || 'Failed to delete playlist');
      }
    }
  };

  if (loading) return <div className="text-white">Loading playlist...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!playlist) return <div className="text-white">Playlist not found.</div>;

  return (
    <div className="p-4 pb-32"> {/* Added padding-bottom to account for player */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">{playlist.playlistTitle} ({playlist.trackCount} tracks)</h1>
        <button
          onClick={handleDeletePlaylist}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Delete Playlist
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {playlist.tracks.map((track) => (
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

export default PlaylistDetailPage;
