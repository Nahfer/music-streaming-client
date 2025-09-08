// Prefer an environment-controlled base URL; normalize to ensure a single trailing '/api'.
const API_BASE_URL = (() => {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || 'https://music-streaming-api-next.vercel.app';
  const normalized = raw.replace(/\/+$/, '');
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
})();

const getAuthHeaders = () => {
  // Guard access to localStorage for SSR
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Centralized fetch helper to reduce duplication and improve error handling
async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const fullPath = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = { ...(options.headers as Record<string, string> || {}), ...getAuthHeaders() };

  const controller = new AbortController();
  const timeout = 15000; // 15s
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(fullPath, { ...options, headers, signal: controller.signal });
    clearTimeout(id);

    // 204 No Content
    if (res.status === 204) return {};

    // Try parse JSON, otherwise capture raw text
    let parsed: any;
    const text = await res.text();
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { raw: text };
      }
    } else {
      parsed = null;
    }

    if (!res.ok) {
      console.warn('API responded with error status', { url: fullPath, status: res.status, body: parsed });
      return parsed ?? {};
    }

    return parsed ?? {};
  } catch (err) {
    if ((err as DOMException)?.name === 'AbortError') {
      console.error('Request timed out', fullPath);
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

// --- API response types ---
// Keep some named types for documentation only, using `any` for now
export type ArtistAPI = any;
export type AlbumAPI = any;
export type TrackAPI = any;
export type GenreAPI = any;
export type PlaylistAPI = any;
export type ProfileAPI = any;
export type SearchAPI = any;
export type LyricsAPI = any;

export const fetchArtists = async (searchQuery: string = ''): Promise<any> =>
  apiFetch(`/artist?artist=${encodeURIComponent(searchQuery)}`);

export const fetchArtistById = async (artistId: string): Promise<any> =>
  apiFetch(`/artist/${encodeURIComponent(artistId)}`);

export const fetchAlbumTracks = async (artistId: string, albumId: string, searchQuery: string = ''): Promise<any> =>
  apiFetch(`/artist/${encodeURIComponent(artistId)}/${encodeURIComponent(albumId)}?track=${encodeURIComponent(searchQuery)}`);

export const fetchGenres = async (): Promise<any> => apiFetch('/discover');

export const fetchTracksByGenre = async (genreId: string, searchQuery: string = ''): Promise<any> =>
  apiFetch(`/discover/${encodeURIComponent(genreId)}?track=${encodeURIComponent(searchQuery)}`);

export const fetchUserPlaylists = async (): Promise<any> => apiFetch('/playlist');

export const fetchPlaylistById = async (playlistId: string): Promise<any> =>
  apiFetch(`/playlist/${encodeURIComponent(playlistId)}`);

export const createPlaylist = async (playlistTitle: string, trackIds: string[]): Promise<any> =>
  apiFetch(`/playlist`, {
    method: 'POST',
    body: JSON.stringify({ playlistTitle, trackIds }),
  });

export const updatePlaylist = async (playlistId: string, playlistTitle?: string, trackIds?: string[]): Promise<any> =>
  apiFetch(`/playlist/${encodeURIComponent(playlistId)}`, {
    method: 'PUT',
    body: JSON.stringify({ playlistTitle, trackIds }),
  });

export const deletePlaylist = async (playlistId: string): Promise<any> =>
  apiFetch(`/playlist/${encodeURIComponent(playlistId)}`, { method: 'DELETE' });

export const fetchUserProfile = async (): Promise<any> => apiFetch('/profile');

// Generic search endpoint - backend should return { artists?: [], albums?: [], tracks?: [] }
export const searchAll = async (query: string): Promise<any> => apiFetch(`/search?q=${encodeURIComponent(query)}`);

// Fetch lyrics for a given track title and artist (used by the inline player lyrics panel)
export const fetchLyrics = async (title: string, artist: string, trackId?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (title) params.append('title', title);
  if (artist) params.append('artist', artist);
  if (trackId) params.append('id', trackId);
  return apiFetch(`/lyrics?${params.toString()}`);
};

// Export helper to format API error objects into strings for frontend components to consume.
export const formatAPIError = (err: unknown): string | null => {
  if (err == null) return null;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

// Add other authenticated API calls here as needed
