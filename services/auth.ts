// Normalize NEXT_PUBLIC_API_BASE_URL and ensure it includes a single trailing '/api'
const API_BASE_URL = (() => {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || 'https://music-streaming-api-next.vercel.app';
  const normalized = raw.replace(/\/+$/, '');
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
})();

const defaultHeaders = () => ({ 'Content-Type': 'application/json' });

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      ...defaultHeaders(),
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Login failed: ${response.status}`);
  }
  return response.json();
};

export const register = async (userData: Record<string, unknown>) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      ...defaultHeaders(),
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
    console.error('Backend registration error:', errorData);
    const errField = errorData.error;
    let errMsg = 'Registration failed';
    if (Array.isArray(errField)) {
      errMsg = errField.join(', ');
    } else if (typeof errField === 'string') {
      errMsg = errField;
    }
    throw new Error(errMsg);
  }

  return response.json();
};
