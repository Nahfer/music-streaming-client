// Prefer an environment-controlled base URL; fallback to the deployed backend.
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || 'https://music-streaming-api-next.vercel.app/api';

const getAuthHeaders = () => {
  // Guard access to localStorage for SSR
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchArtists = async (searchQuery: string = '') => {
  const response = await fetch(`${API_BASE_URL}/artist?artist=${searchQuery}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Backend API error (fetchArtists):', errorData);
    throw new Error(errorData.error?.join(', ') || errorData.error || `Error: ${response.status}`);
  }
  return response.json();
};

export const fetchArtistById = async (artistId: string) => {
  const response = await fetch(`${API_BASE_URL}/artist/${artistId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Backend API error (fetchArtistById):', errorData);
    throw new Error(errorData.error?.join(', ') || errorData.error || `Error: ${response.status}`);
  }
  return response.json();
};

export const fetchAlbumTracks = async (artistId: string, albumId: string, searchQuery: string = '') => {
  const response = await fetch(`${API_BASE_URL}/artist/${artistId}/${albumId}?track=${searchQuery}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Backend API error (fetchAlbumTracks):', errorData);
    throw new Error(errorData.error?.join(', ') || errorData.error || `Error: ${response.status}`);
  }
  return response.json();
};

export const fetchGenres = async () => {
  const response = await fetch(`${API_BASE_URL}/discover`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Backend API error (fetchGenres):', errorData);
    throw new Error(errorData.error?.join(', ') || errorData.error || `Error: ${response.status}`);
  }
  return response.json();
};

export const fetchTracksByGenre = async (genreId: string, searchQuery: string = '') => {
  const response = await fetch(`${API_BASE_URL}/discover/${genreId}?track=${searchQuery}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Backend API error (fetchTracksByGenre):', errorData);
    throw new Error(errorData.error?.join(', ') || errorData.error || `Error: ${response.status}`);
  }
  return response.json();
};

export const fetchUserPlaylists = async () => {
  const response = await fetch(`${API_BASE_URL}/playlist`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Backend API error (fetchUserPlaylists):', errorData);
    throw new Error(errorData.error?.join(', ') || errorData.error || `Error: ${response.status}`);
  }
  return response.json();
};

export const fetchPlaylistById = async (playlistId: string) => {
  const response = await fetch(`${API_BASE_URL}/playlist/${playlistId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Backend API error (fetchPlaylistById):', errorData);
    throw new Error(errorData.error?.join(', ') || errorData.error || `Error: ${response.status}`);
  }
  return response.json();
};

export const createPlaylist = async (playlistTitle: string, trackIds: string[]) => {
  const response = await fetch(`${API_BASE_URL}/playlist`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ playlistTitle, trackIds }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Backend API error (createPlaylist):', errorData);
    throw new Error(errorData.error?.join(', ') || errorData.error || `Error: ${response.status}`);
  }
  return response.json();
};

export const updatePlaylist = async (playlistId: string, playlistTitle?: string, trackIds?: string[]) => {
  const response = await fetch(`${API_BASE_URL}/playlist/${playlistId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ playlistTitle, trackIds }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Backend API error (updatePlaylist):', errorData);
    throw new Error(errorData.error?.join(', ') || errorData.error || `Error: ${response.status}`);
  }
  return response.json();
};

export const deletePlaylist = async (playlistId: string) => {
  const response = await fetch(`${API_BASE_URL}/playlist/${playlistId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Backend API error (deletePlaylist):', errorData);
    throw new Error(errorData.error?.join(', ') || errorData.error || `Error: ${response.status}`);
  }
  return response.json();
};

export const fetchUserProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Backend API error (fetchUserProfile):', errorData);
    throw new Error(errorData.error?.join(', ') || errorData.error || `Error: ${response.status}`);
  }
  return response.json();
};

// Add other authenticated API calls here as needed
