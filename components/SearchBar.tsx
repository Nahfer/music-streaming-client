'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Input from './ui/Input';
import { searchAll } from '@/services/api';
import * as Popover from '@radix-ui/react-popover';
import { Search as SearchIcon, ChevronsRight } from 'lucide-react';
import Loading from './ui/Loading';

interface SearchResult {
  id: string;
  type: 'artist' | 'album' | 'track' | 'genre';
  title: string;
  subtitle?: string;
  href: string;
  thumbnail?: string | null;
}

// API response shapes (partial)
interface ArtistAPI {
  aid?: string;
  id?: string;
  name?: string;
  profileImageUrl?: string | null;
}
interface AlbumAPI {
  aaid: string;
  title: string;
  artistid?: string;
  albumCover?: string | null;
}
interface TrackAPI {
  tid: string;
  title: string;
  artistId?: string;
  albumId?: string;
  album?: { aaid?: string; albumCover?: string | null };
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchAll(query);
        const searchResults: SearchResult[] = [];

        // Artists
        if (Array.isArray(data.artists)) {
          (data.artists as ArtistAPI[]).forEach((artist) => {
            if (artist.name && artist.name.toLowerCase().includes(query.toLowerCase())) {
              const id = artist.aid ?? artist.id ?? '';
              searchResults.push({ id: String(id), type: 'artist', title: artist.name, href: `/artist/${String(id)}`, thumbnail: artist.profileImageUrl ?? '/default-artist.png' });
            }
          });
        }

        // Albums
        if (Array.isArray(data.albums)) {
          (data.albums as AlbumAPI[]).forEach((album) => {
            if (album.title && album.title.toLowerCase().includes(query.toLowerCase())) {
              const aid = album.aaid;
              const href = album.artistid ? `/artist/${album.artistid}/${aid}` : `/artist/unknown/${aid}`;
              searchResults.push({ id: aid, type: 'album', title: album.title, subtitle: album.artistid, href, thumbnail: album.albumCover ?? '/default-album.png' });
            }
          });
        }

        // Tracks
        if (Array.isArray(data.tracks)) {
          (data.tracks as TrackAPI[]).forEach((track) => {
            if (track.title && track.title.toLowerCase().includes(query.toLowerCase())) {
              const href = track.albumId ? (track.artistId ? `/artist/${track.artistId}/${track.albumId}` : `/artist/unknown/${track.albumId}`) : (track.artistId ? `/artist/${track.artistId}` : '/');
              const thumb = track.album?.albumCover ?? '/default-album.png';
              searchResults.push({ id: track.tid, type: 'track', title: track.title, subtitle: track.albumId, href, thumbnail: thumb });
            }
          });
        }

        setResults(searchResults.slice(0, 10));
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleResultClick = (href: string) => {
    setQuery('');
    setShowResults(false);
    router.push(href);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'artist': return 'text-blue-400';
      case 'album': return 'text-yellow-400';
      case 'track': return 'text-pink-400';
      case 'genre': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const cornerRadius = '12px'; // consistent corner radius for input and dropdown (rounded rectangle)

  return (
    <div ref={searchRef} className="relative w-full">
      <Popover.Root open={showResults} onOpenChange={setShowResults}>
        <Popover.Trigger asChild>
          <div>
            <Input
              type="text"
              placeholder="Search artists, albums, tracks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowResults(true)}
              icon={
                <SearchIcon className="w-5 h-5 text-gray-400" />
              }
              className="w-full"
              style={{ borderRadius: cornerRadius }}
            />
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="center"
            sideOffset={8}
            role="listbox"
            aria-label="Search results"
            className="mt-2 w-full bg-gray-800 border border-gray-700 shadow-xl z-50 max-h-80 overflow-y-auto"
            style={{ borderRadius: cornerRadius, overflow: 'hidden' }}
          >
            {isLoading ? (
              <div className="p-4">
                <Loading message="Searching..." />
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result.href)}
                    role="option"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleResultClick(result.href); } }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors duration-200 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 relative flex-shrink-0 rounded-md overflow-hidden bg-gray-700">
                        {result.thumbnail ? (
                          result.thumbnail.startsWith('/') ? (
                            <Image src={result.thumbnail} alt={result.title} fill className="object-cover" sizes="40px" />
                          ) : (
                            // external images: use native img to avoid image optimization/domain issues; lazy-load for perf
                            <img src={result.thumbnail} alt={result.title} className="object-cover w-10 h-10" loading="lazy" />
                          )
                        ) : (
                          <div className="w-10 h-10 bg-gray-600" />
                        )}

                        </div>

                      <div className="truncate">
                        <div className="text-white font-medium truncate">{result.title}</div>
                        {result.subtitle && <div className={`text-sm ${getTypeColor(result.type)} capitalize truncate`}>{result.subtitle}</div>}
                      </div>
                    </div>

                    <ChevronsRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-200 ml-2 flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-gray-400">
                {`No results found for "${query}"`}
              </div>
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export default SearchBar;