import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <h2 className="text-xl font-semibold mb-4">Navigation</h2>
      <ul>
        <li className="mb-2"><Link href="/" className="hover:text-blue-400">Home</Link></li>
        <li className="mb-2"><Link href="/artists" className="hover:text-blue-400">Artists</Link></li>
        <li className="mb-2"><Link href="/discover" className="hover:text-blue-400">Discover</Link></li>
        <li className="mb-2"><Link href="/playlists" className="hover:text-blue-400">Playlists</Link></li>
        <li className="mb-2"><Link href="/profile" className="hover:text-blue-400">Profile</Link></li>
        <li className="mb-2"><Link href="/login" className="hover:text-blue-400">Login</Link></li>
        <li className="mb-2"><Link href="/signup" className="hover:text-blue-400">Sign Up</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
