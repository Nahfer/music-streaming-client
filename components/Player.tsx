"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { fetchLyrics } from '../services/api';

interface TrackInfo {
  id?: string;
  title: string;
  artistName: string;
  audioUrl: string;
  artworkUrl?: string;
}

interface PlayerProps {
  currentTrack: TrackInfo | null;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleLoop?: (loop: boolean) => void;
  onShowLyrics?: (track: TrackInfo) => void;
  // optional playlist for next/prev navigation
  tracks?: TrackInfo[];
  // optional callback to notify parent of track changes (un/muted)
  onTrackChange?: (track: TrackInfo | null) => void;
}

const Player: React.FC<PlayerProps> = ({ currentTrack, onNext, onPrev, onToggleLoop, onShowLyrics, tracks, onTrackChange }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  // internal track state when parent does not control currentTrack
  const [internalTrack, setInternalTrack] = useState<TrackInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);

  // activeTrack: prefer parent-controlled currentTrack, fallback to internalTrack
  const activeTrack = currentTrack ?? internalTrack;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeTrack) {
      if (audio.src !== activeTrack.audioUrl) {
        // ensure we fully reset the audio element before changing source to avoid
        // carrying over buffered/metadata from previous track (fixes incorrect album/track mismatch)
        try { audio.pause(); } catch { /* ignore */ }
        audio.removeAttribute('src');
        audio.src = activeTrack.audioUrl;
        audio.load();
        audio.currentTime = 0;
        setCurrentTime(0);
        setDuration(0);
        setBuffered(0);
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
      setBuffered(0);
    }
  }, [activeTrack, isLooping]);

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
      // initial buffered update
      try {
        const buf = audioRef.current.buffered;
        if (buf && buf.length > 0) {
          setBuffered(buf.end(buf.length - 1));
        }
      } catch { /* ignore */ }
    }
  };

  // update buffered state during progress/timeupdate
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateBuffered = () => {
      try {
        const buf = audio.buffered;
        if (buf && buf.length > 0) {
          setBuffered(buf.end(buf.length - 1));
        }
      } catch { /* ignore browsers */ }
    };
    audio.addEventListener('progress', updateBuffered);
    audio.addEventListener('timeupdate', updateBuffered);
    return () => {
      audio.removeEventListener('progress', updateBuffered);
      audio.removeEventListener('timeupdate', updateBuffered);
    };
  }, []);

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

  const findTrackIndex = (list: TrackInfo[] | undefined, track: TrackInfo | null) => {
    if (!list || !track) return -1;
    return list.findIndex(t => (t.id && track.id ? t.id === track.id : t.audioUrl === track.audioUrl));
  };

  const navigateToTrack = (target: TrackInfo) => {
    // prefer to notify parent via onTrackChange
    if (onTrackChange) {
      onTrackChange(target);
      return;
    }
    // if parent controls currentTrack but doesn't provide onTrackChange, try calling onPrev/onNext as fallback
    if (currentTrack) {
      if (onNext || onPrev) {
        // calling existing handlers so parent can update
        if (onNext) onNext();
        if (onPrev) onPrev();
        return;
      }
      // otherwise update audio source locally (UI may be out of sync with parent)
    }
    setInternalTrack(target);
  };

  const handlePrev = () => {
    if (tracks && tracks.length > 0) {
      const idx = findTrackIndex(tracks, activeTrack);
      const prevIdx = idx > 0 ? idx - 1 : tracks.length - 1; // wrap-around
      const prev = tracks[prevIdx];
      if (prev) {
        navigateToTrack(prev);
        return;
      }
    }
    if (onPrev) return onPrev();
    window.dispatchEvent(new CustomEvent('player-prev'));
  };

  const handleNext = () => {
    if (tracks && tracks.length > 0) {
      const idx = findTrackIndex(tracks, activeTrack);
      const nextIdx = idx >= 0 && idx < tracks.length - 1 ? idx + 1 : 0; // wrap-around
      const next = tracks[nextIdx];
      if (next) {
        navigateToTrack(next);
        return;
      }
    }
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
    if (!activeTrack) return;
    if (onShowLyrics) onShowLyrics(activeTrack);

    const isOpening = !showLyricsPanel;
    setShowLyricsPanel(isOpening);

    if (isOpening) {
      setLoadingLyrics(true);
      setLyricsError(null);
      const trackTyped = activeTrack as TrackInfo & { id?: string | undefined };
      const id = trackTyped?.id;
      fetchLyrics(activeTrack.title, activeTrack.artistName, id)
        .then((data: unknown) => {
          if (!data) return setLyrics('No lyrics found');
          if (typeof data === 'string') return setLyrics(data);
          if (typeof data === 'object' && data !== null) {
            const obj = data as Record<string, unknown>;
            if ('lyrics' in obj && typeof obj.lyrics === 'string') return setLyrics(obj.lyrics);
            if ('data' in obj && typeof obj.data === 'object' && obj.data !== null) {
              const inner = obj.data as Record<string, unknown>;
              if ('lyrics' in inner && typeof inner.lyrics === 'string') return setLyrics(inner.lyrics);
            }
            if ('message' in obj && typeof obj.message === 'string') return setLyricsError(obj.message);
            if ('error' in obj && typeof obj.error === 'string') return setLyricsError(obj.error);
            return setLyrics(JSON.stringify(obj));
          }
          return setLyrics('No lyrics available');
        })
        .catch((err: unknown) => {
          console.error('Failed to load lyrics', err);
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
      window.dispatchEvent(new CustomEvent('player-lyrics', { detail: { track: activeTrack } }));
    }
  };

  if (!activeTrack) {
    return (
      <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-4 flex items-center justify-center text-white">
        No track selected
      </div>
    );
  }

  return (
    <div className={`fixed bottom-0 left-0 w-full bg-gray-800 p-3 flex items-center justify-between text-white shadow-lg z-40 ${isCompact ? 'py-2' : ''}`}>
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      <div className="flex items-center min-w-0 gap-3">
        {/* album artwork removed per request */}

        <div className="flex items-center">
          <button onClick={handlePrev} aria-label="Previous" className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-150">
            <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Left-pointing triangle + bar on the right for Previous */}
              <path d="M15 18V6L7.5 12 15 18z" fill="currentColor" opacity="0.95" />
              <rect x="17" y="6" width="2" height="12" fill="currentColor" opacity="0.95" />
            </svg>
          </button>

          <button onClick={togglePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} className="mx-2 p-2 rounded-full hover:bg-gray-700 transition-colors duration-150">
            {isPlaying ? (
              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.95" />
                <rect x="9" y="8" width="2" height="8" fill="#0f172a" />
                <rect x="13" y="8" width="2" height="8" fill="#0f172a" />
              </svg>
            ) : (
              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.95" />
                <path d="M10 8l6 4-6 4V8z" fill="#0f172a" />
              </svg>
            )}
          </button>

          <button onClick={handleNext} aria-label="Next" className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-150">
            <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Bar on the left + right-pointing triangle for Next */}
              <rect x="5" y="6" width="2" height="12" fill="currentColor" opacity="0.95" />
              <path d="M7.5 6L15 12 7.5 18V6z" fill="currentColor" opacity="0.95" />
            </svg>
          </button>
        </div>

        <div className="text-sm ml-2 min-w-0">
          <p className="font-bold truncate max-w-xs">{activeTrack.title}</p>
          <p className="text-gray-400 truncate max-w-xs">{activeTrack.artistName}</p>
        </div>
      </div>

      <div className="flex items-center flex-1 px-4 min-w-0">
        <span className="text-xs text-gray-400 w-12 text-right hidden sm:block">{formatTime(currentTime)}</span>

        <div
          ref={progressRef}
          className="relative flex-1 mx-3 h-3 flex items-center"
          aria-hidden="true"
        >
          {/* background */}
          <div className="absolute inset-0 bg-gray-600 rounded-full" />
          {/* buffered */}
          <div className="absolute inset-y-0 left-0 bg-gray-500 rounded-full" style={{ width: duration ? `${Math.min(100, (buffered / duration) * 100)}%` : '0%' }} />
          {/* played */}
          <div className="absolute inset-y-0 left-0 bg-teal-500 rounded-full" style={{ width: duration ? `${Math.min(100, (currentTime / duration) * 100)}%` : '0%' }} />

          {/* accessible input on top */}
          <input
            type="range"
            min={0}
            max={Number.isFinite(duration) && duration > 0 ? duration : 0}
            step={0.01}
            value={Number.isFinite(currentTime) ? currentTime : 0}
            onChange={handleSeekChange}
            onKeyDown={onSeekKeyDown}
            className="player-seek appearance-none w-full h-3 bg-transparent relative z-10 cursor-pointer"
            aria-label="Seek"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={Number.isFinite(duration) ? duration : 0}
            aria-valuenow={Number.isFinite(currentTime) ? currentTime : 0}
          />
          {/* Thumb styling for the seek control (white circle) */}
          <style jsx>{`
            .player-seek::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #ffffff;
              box-shadow: 0 0 0 4px rgba(255,255,255,0.02), 0 0 0 2px rgba(0,0,0,0.15);
              border: none;
              margin-top: -5px; /* center on 3px track */
              cursor: pointer;
            }
            .player-seek::-webkit-slider-runnable-track { height: 6px; }
            .player-seek::-moz-range-thumb {
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #ffffff;
              border: none;
              box-shadow: 0 0 0 2px rgba(0,0,0,0.15);
              cursor: pointer;
            }
            .player-seek::-moz-range-track { height: 6px; }
          `}</style>
        </div>

        <span className="text-xs text-gray-400 w-12 hidden sm:block">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <button onClick={handleToggleLoop} aria-pressed={isLooping} className={`p-2 rounded-md transition-colors duration-150 ${isLooping ? 'bg-teal-600 text-black' : 'hover:bg-gray-700'}`} aria-label="Toggle loop">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M7 7h10v3l4-4-4-4v3H6a4 4 0 00-4 4v3h2V10a2 2 0 012-2z" fill="currentColor" opacity="0.95" />
            <path d="M17 17H7v-3l-4 4 4 4v-3h11a4 4 0 004-4v-3h-2v3a2 2 0 01-2 2z" fill="currentColor" opacity="0.95" />
          </svg>
        </button>

        <button onClick={handleShowLyrics} className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-150" aria-label="Lyrics">
          <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M21 6.5a2.5 2.5 0 00-2.5-2.5H5.5A2.5 2.5 0 003 6.5v7A2.5 2.5 0 005.5 16H7v3l3-3h8.5A2.5 2.5 0 0021 13.5v-7z" stroke="currentColor" strokeWidth="0" fill="currentColor" opacity="0.95" />
            <path d="M9 9v6l4-1.5V7" stroke="#0f172a" strokeWidth="0" />
          </svg>
        </button>

        <button onClick={toggleMute} className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-150" aria-label={isMuted ? 'Unmute' : 'Mute'}>
          {/* volume icons */}
          {isMuted || volume === 0 ? (
            <svg className="w-5 h-5 text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16.5 12a4.5 4.5 0 01-4.5 4.5V7.5a4.5 4.5 0 014.5 4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 5l-14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : volume > 0.5 ? (
            <svg className="w-5 h-5 text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M5 9v6h4l5 4V5L9 9H5z" fill="currentColor"/>
              <path d="M19 8a5 5 0 010 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M5 9v6h4l5 4V5L9 9H5z" fill="currentColor"/>
            </svg>
          )}
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

        <button onClick={() => setIsCompact(!isCompact)} title="Toggle compact" className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-150">
          <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {isCompact ? (
              <path d="M4 7h16v2H4V7zm0 4h10v2H4v-2z" fill="currentColor" />
            ) : (
              <path d="M4 6h16v2H4V6zm0 4h16v2H4v-2z" fill="currentColor" />
            )}
          </svg>
        </button>
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
