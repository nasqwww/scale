const API_URL = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(body.error ?? response.statusText, response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ ok: boolean }>('/health'),

  register: (body: { username: string; email: string; password: string; displayName?: string; language?: string }) =>
    request<{ token: string; user: Record<string, unknown> }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { username: string; password: string }) =>
    request<{ token: string; user: Record<string, unknown> }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  verifyEmail: (token: string) =>
    request<{ verified: boolean }>('/api/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),

  me: (token: string) => request<{ user: Record<string, unknown>; achievements: unknown[]; recentSessions: unknown[] }>('/api/users/me', {}, token),

  patchMe: (token: string, body: Record<string, unknown>) =>
    request('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) }, token),

  leaderboard: (scope: string, token?: string) =>
    request<{ entries: unknown[] }>(`/api/leaderboard/${scope}`, {}, token),

  submitLeaderboard: (
    token: string,
    body: { score: number; rankLabel: string; scope: string; countryCode?: string },
  ) => request('/api/leaderboard/submit', { method: 'POST', body: JSON.stringify(body) }, token),

  submitSession: (body: Record<string, unknown>, token?: string) =>
    request<{ sessionId: string }>('/api/games/sessions', { method: 'POST', body: JSON.stringify(body) }, token),

  friends: (token: string) => request<{ friends: unknown[]; pendingRequests: unknown[] }>('/api/friends', {}, token),

  friendRequest: (token: string, username: string) =>
    request('/api/friends/request', { method: 'POST', body: JSON.stringify({ username }) }, token),

  adminAnalytics: (token: string) => request<Record<string, number>>('/api/admin/analytics', {}, token),

  adminPlayers: (token: string, q = '') => request<{ players: unknown[] }>(`/api/admin/players?q=${encodeURIComponent(q)}`, {}, token),
};
