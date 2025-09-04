import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-5xl font-bold text-white mb-6">Welcome to Music Stream!</h1>
      <p className="text-xl text-gray-300 mb-8 text-center">
        Your ultimate destination for discovering and enjoying music.
      </p>
      <div className="flex space-x-4">
        <Link href="/discover" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300">
          Discover Music
        </Link>
        <Link href="/artists" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300">
          Explore Artists
        </Link>
        <Link href="/playlists" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300">
          My Playlists
        </Link>
      </div>
    </div>
  );
}
