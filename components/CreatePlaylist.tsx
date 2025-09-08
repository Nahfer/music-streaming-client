"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchUserPlaylists, createPlaylist } from '@/services/api';
import Loading from './ui/Loading';

interface Track {
  tid: string;
  title: string;
  artist?: { name?: string };
  album?: { aaid?: string; albumCover?: string | null };
}

export default function CreatePlaylist({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchUserPlaylists();
        // Aggregate tracks from all playlists and dedupe by tid
        const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
        let tracksFromResponse: Track[] = [];
        if (isRecord(data)) {
          const playlists = data['playlists'];
          if (Array.isArray(playlists)) {
            const map = new Map<string, Track>();
            for (const p of playlists) {
              if (!isRecord(p)) continue;
              const pTracks = p['tracks'];
              if (!Array.isArray(pTracks)) continue;
              for (const t of pTracks) {
                if (!isRecord(t)) continue;
                const tid = typeof t['tid'] === 'string' ? t['tid'] as string : String(t['tid'] || '');
                if (map.has(tid)) continue;
                const title = t['title'] ? String(t['title']) : '';
                const artist = isRecord(t['artist']) && typeof t['artist']!['name'] === 'string' ? { name: String((t['artist'] as Record<string, unknown>)['name']) } : undefined;
                const album = isRecord(t['album']) ? { aaid: String((t['album'] as Record<string, unknown>)['aaid'] || ''), albumCover: (t['album'] as Record<string, unknown>)['albumCover'] as string | null } : undefined;
                map.set(tid, { tid, title, artist, album });
              }
            }
            tracksFromResponse = Array.from(map.values());
          }
        }
        setTracks(tracksFromResponse);
        // helpful runtime log for debugging image fields
        console.log('CreatePlaylist - tracks loaded:', tracksFromResponse);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || 'Failed to load tracks');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggle = (tid: string) => {
    setSelected((s) => ({ ...s, [tid]: !s[tid] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trackIds = Object.keys(selected).filter((k) => selected[k]);
    if (!title.trim()) return setError('Please provide a playlist title');
    if (trackIds.length === 0) return setError('Please select at least one track');

    try {
      setSubmitting(true);
      await createPlaylist(title.trim(), trackIds);
      setTitle('');
      setSelected({});
      if (onCreated) onCreated();
      alert('Playlist created');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to create playlist');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading your tracks..." />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-800 rounded-lg shadow-lg">
      <input
        type="text"
        placeholder="New playlist title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 rounded bg-gray-700 text-white w-full mb-4"
        disabled={submitting}
      />

      <div className="max-h-48 overflow-auto mb-4">
        {tracks.length === 0 && <div className="text-gray-400">You have no tracks to add.</div>}
        {tracks.map((t) => (
          <label key={t.tid} className="flex items-center gap-2 text-white mb-1">
            <input type="checkbox" checked={!!selected[t.tid]} onChange={() => toggle(t.tid)} disabled={submitting} />
            <div className="w-10 h-10 relative flex-shrink-0">
              {(() => {
                const src = t.album?.albumCover ?? '/default-album.png';
                const isExternal = typeof src === 'string' && /^https?:\/\//i.test(src);
                if (isExternal) {
                  return (
                    <img src={src} alt={t.title} className="object-cover rounded-md w-10 h-10" />
                  );
                }
                return (
                  <Image
                    src={src}
                    alt={t.title}
                    fill
                    className="object-cover rounded-md"
                    sizes="40px"
                  />
                );
              })()}
            </div>
            <span>{t.title}{t.artist?.name ? ` — ${t.artist.name}` : ''}</span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
}
