"use client";

import React, { useRef, useState, useEffect } from 'react';

interface PlayerProps {
  currentTrack: {
    title: string;
    artistName: string;
    audioUrl: string;
  } | null;
}

const Player: React.FC<PlayerProps> = ({ currentTrack }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-4 flex items-center justify-center text-white">
        No track selected
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-4 flex items-center justify-between text-white shadow-lg">
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
      <div className="flex items-center">
        <button onClick={togglePlayPause} className="text-white text-2xl mx-4">
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <div className="text-sm">
          <p className="font-bold">{currentTrack.title}</p>
          <p className="text-gray-400">{currentTrack.artistName}</p>
        </div>
      </div>
      <div className="flex items-center w-1/2 mx-4">
        <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => {
            if (audioRef.current) {
              audioRef.current.currentTime = parseFloat(e.target.value);
            }
          }}
          className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mx-2"
        />
        <span className="text-xs text-gray-400">{formatTime(duration)}</span>
      </div>
      {/* Volume control, etc. can be added here */}
    </div>
  );
};

export default Player;
