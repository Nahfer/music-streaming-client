"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { fetchLyrics } from '../services/api';

interface TrackInfo {
  id?: string;
  title: string;
  artistName: string;
  audioUrl: string;
}

interface PlayerProps {
  currentTrack: TrackInfo | null;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleLoop?: (loop: boolean) => void;
  onShowLyrics?: (track: TrackInfo) => void;
}

const Player: React.FC<PlayerProps> = ({ currentTrack, onNext, onPrev, onToggleLoop, onShowLyrics }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack) {
      if (audio.src !== currentTrack.audioUrl) {
        audio.src = currentTrack.audioUrl;
        audio.currentTime = 0;
        setCurrentTime(0);
        setDuration(0);
      }

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(true);
      }
      audio.loop = isLooping;
    } else {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentTrack, isLooping]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        try { audio.pause(); } catch { /* ignore */ }
        audio.removeAttribute('src');
        audio.load();
      }
    };
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.getAttribute('role') === 'slider')) return;
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlayPause]);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(Number(audioRef.current.currentTime) || 0);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      const d = Number(audioRef.current.duration);
      setDuration(Number.isFinite(d) ? d : 0);
    }
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (value: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(value, Number.isFinite(duration) && duration > 0 ? duration : value));
    audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSeek(Number(e.target.value));
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !isMuted;
    setIsMuted(next);
    audioRef.current.muted = next;
  };

  const handleVolumeChange = (v: number) => {
    if (!audioRef.current) return;
    const vol = Math.max(0, Math.min(1, v));
    setVolume(vol);
    audioRef.current.volume = vol;
    if (vol > 0 && isMuted) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  };

  // keyboard seeking for the range input
  const onSeekKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const step = 5; // seconds
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleSeek(Math.max(0, currentTime - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleSeek(Math.min(duration || Infinity, currentTime + step));
    }
  };

  const handlePrev = () => {
    if (onPrev) return onPrev();
    // dispatch event for external handlers
    window.dispatchEvent(new CustomEvent('player-prev'));
  };

  const handleNext = () => {
    if (onNext) return onNext();
    window.dispatchEvent(new CustomEvent('player-next'));
  };

  const handleToggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    if (audioRef.current) audioRef.current.loop = next;
    if (onToggleLoop) onToggleLoop(next);
    window.dispatchEvent(new CustomEvent('player-loop', { detail: { loop: next } }));
  };

  const handleShowLyrics = () => {
    if (!currentTrack) return;
    // If a parent provided a handler, call it (preserve existing behavior)
    if (onShowLyrics) onShowLyrics(currentTrack);

    // Determine whether we're opening the panel
    const isOpening = !showLyricsPanel;
    setShowLyricsPanel(isOpening);

    if (isOpening) {
      setLoadingLyrics(true);
      setLyricsError(null);
      // prefer to request by track id if available
      const trackTyped = currentTrack as TrackInfo & { id?: string | undefined };
      const id = trackTyped?.id;
      fetchLyrics(currentTrack.title, currentTrack.artistName, id)
        .then((data: unknown) => {
          // Backend may return { lyrics: string } or a raw string
          if (!data) return setLyrics('No lyrics found');
          if (typeof data === 'string') return setLyrics(data);
          if (typeof data === 'object' && data !== null) {
            const obj = data as Record<string, unknown>;
            // prioritize explicit fields
            if ('lyrics' in obj && typeof obj.lyrics === 'string') return setLyrics(obj.lyrics);
            if ('data' in obj && typeof obj.data === 'object' && obj.data !== null) {
              const inner = obj.data as Record<string, unknown>;
              if ('lyrics' in inner && typeof inner.lyrics === 'string') return setLyrics(inner.lyrics);
            }
            // If backend provides message or error field, surface it
            if ('message' in obj && typeof obj.message === 'string') return setLyricsError(obj.message);
            if ('error' in obj && typeof obj.error === 'string') return setLyricsError(obj.error);
            // Fallback to stringify
            return setLyrics(JSON.stringify(obj));
          }
          return setLyrics('No lyrics available');
        })
        .catch((err: unknown) => {
          console.error('Failed to load lyrics', err);
          // try to show backend message if present
          let msg = 'Unable to load lyrics';
          if (err && typeof err === 'object' && err !== null) {
            const e = err as { message?: unknown };
            if (typeof e.message === 'string') msg = e.message;
          }
          setLyricsError(String(msg));
          setLyrics('');
        })
        .finally(() => setLoadingLyrics(false));

    } else {
      // closing - emit event for backward compatibility
      window.dispatchEvent(new CustomEvent('player-lyrics', { detail: { track: currentTrack } }));
    }
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-4 flex items-center justify-center text-white">
        No track selected
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-4 flex items-center justify-between text-white shadow-lg z-40">
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      <div className="flex items-center min-w-0">
        <button onClick={handlePrev} aria-label="Previous" className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-150">
          {/* Previous icon - corrected direction */}
          <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M18 6v12l-10.5-6L18 6zM6 6h2v12H6z" fill="currentColor" opacity="0.95" />
          </svg>
        </button>

        <button onClick={togglePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} className="mx-3 p-2 rounded-full hover:bg-gray-700 transition-colors duration-150">
          {/* Play / Pause - YouTube Music style circular icon */}
          {isPlaying ? (
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.9" />
              <rect x="9" y="8" width="2" height="8" fill="#0f172a" />
              <rect x="13" y="8" width="2" height="8" fill="#0f172a" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.9" />
              <path d="M10 8l6 4-6 4V8z" fill="#0f172a" />
            </svg>
          )}
        </button>

        <button onClick={handleNext} aria-label="Next" className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-150">
          {/* Next icon - corrected direction */}
          <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 6h2v12H6zM16.5 12L6 6v12l10.5-6z" fill="currentColor" opacity="0.95" />
          </svg>
        </button>

        <div className="text-sm ml-4 min-w-0">
          <p className="font-bold truncate max-w-xs">{currentTrack.title}</p>
          <p className="text-gray-400 truncate max-w-xs">{currentTrack.artistName}</p>
        </div>
      </div>

      <div className="flex items-center flex-1 px-4">
        <span className="text-xs text-gray-400 w-12 text-right">{formatTime(currentTime)}</span>

        <input
          type="range"
          min={0}
          max={Number.isFinite(duration) && duration > 0 ? duration : 0}
          step={0.01}
          value={Number.isFinite(currentTime) ? currentTime : 0}
          onChange={handleSeekChange}
          onKeyDown={onSeekKeyDown}
          className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mx-3"
          aria-label="Seek"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={Number.isFinite(duration) ? duration : 0}
          aria-valuenow={Number.isFinite(currentTime) ? currentTime : 0}
        />

        <span className="text-xs text-gray-400 w-12">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <button onClick={handleToggleLoop} aria-pressed={isLooping} className={`p-2 rounded-md transition-colors duration-150 ${isLooping ? 'bg-teal-600 text-black' : 'hover:bg-gray-700'}`} aria-label="Toggle loop">
          {/* Loop icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M7 7h10v3l4-4-4-4v3H6a4 4 0 00-4 4v3h2V10a2 2 0 012-2z" fill="currentColor" opacity="0.95" />
            <path d="M17 17H7v-3l-4 4 4 4v-3h11a4 4 0 004-4v-3h-2v3a2 2 0 01-2 2z" fill="currentColor" opacity="0.95" />
          </svg>
        </button>

        <button onClick={handleShowLyrics} className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-150" aria-label="Lyrics">
          {/* Lyrics icon (speech bubble + music note) */}
          <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M21 6.5a2.5 2.5 0 00-2.5-2.5H5.5A2.5 2.5 0 003 6.5v7A2.5 2.5 0 005.5 16H7v3l3-3h8.5A2.5 2.5 0 0021 13.5v-7z" stroke="currentColor" strokeWidth="0" fill="currentColor" opacity="0.95" />
            <path d="M9 9v6l4-1.5V7" stroke="#0f172a" strokeWidth="0" />
          </svg>
        </button>

        <button onClick={toggleMute} className="text-gray-300 hover:text-white" aria-label={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted || volume === 0 ? '🔇' : '🔊'}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          aria-label="Volume"
        />
      </div>

      {/* Inline lyrics panel (renders above the player) */}
      {showLyricsPanel && (
        <div className="absolute bottom-full mb-2 right-4 w-80 max-h-[60vh] overflow-auto bg-gray-900 text-white p-3 rounded-lg shadow-lg z-50">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold">Lyrics</h4>
            <button onClick={() => setShowLyricsPanel(false)} aria-label="Close lyrics" className="text-gray-300 hover:text-white">✕</button>
          </div>
          <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
            {loadingLyrics ? 'Loading…' : (lyricsError ? lyricsError : (lyrics || 'No lyrics available'))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
