import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser, LocaleCode, PlayerProfile } from '../types';
import { api } from '../services/api';
import { createGuestProfile, loadLocalProfile, saveLocalProfile } from '../services/profileService';
import { setLocale } from '../i18n';

interface AuthContextValue {
  profile: PlayerProfile;
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error?: string;
  login: (username: string, password: string) => Promise<void>;
  register: (input: { username: string; email: string; password: string; displayName?: string }) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  syncLanguage: (locale: LocaleCode) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = 'scale.token.v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadLocalProfile());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState<string>();

  useEffect(() => {
    setLocale(profile.language);
  }, [profile.language]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .me(token)
      .then((payload) => {
        const row = payload.user as Record<string, unknown>;
        setUser({
          id: String(row.id),
          username: String(row.username),
          email: String(row.email),
          displayName: String(row.display_name),
          role: String(row.role),
          emailVerified: Boolean(row.email_verified),
          language: (row.language as LocaleCode) ?? 'en',
          avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
        });
        setProfile((existing) => ({
          ...existing,
          uid: String(row.id),
          mode: 'registered',
          displayName: String(row.display_name),
          username: String(row.username),
          photoURL: row.avatar_url ? String(row.avatar_url) : undefined,
          language: (row.language as LocaleCode) ?? existing.language,
          role: String(row.role),
          token,
        }));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const persistToken = useCallback((nextToken: string | null) => {
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
    else localStorage.removeItem(TOKEN_KEY);
    setToken(nextToken);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setError(undefined);
    const result = await api.login({ username, password });
    persistToken(result.token);
    const nextProfile: PlayerProfile = {
      ...loadLocalProfile(),
      uid: String(result.user.id),
      mode: 'registered',
      displayName: String(result.user.displayName),
      username: String(result.user.username),
      language: (result.user.language as LocaleCode) ?? 'en',
      token: result.token,
      role: String(result.user.role),
      updatedAt: new Date().toISOString(),
    };
    saveLocalProfile(nextProfile);
    setProfile(nextProfile);
  }, [persistToken]);

  const register = useCallback(
    async (input: { username: string; email: string; password: string; displayName?: string }) => {
      setError(undefined);
      const result = await api.register({ ...input, language: profile.language });
      persistToken(result.token);
      const nextProfile: PlayerProfile = {
        ...createGuestProfile(),
        uid: String(result.user.id),
        mode: 'registered',
        displayName: String(result.user.displayName ?? input.displayName ?? input.username),
        username: String(result.user.username),
        language: profile.language,
        token: result.token,
        role: String(result.user.role),
      };
      saveLocalProfile(nextProfile);
      setProfile(nextProfile);
    },
    [persistToken, profile.language],
  );

  const continueAsGuest = useCallback(() => {
    const guest = createGuestProfile();
    saveLocalProfile(guest);
    setProfile(guest);
    setUser(null);
    persistToken(null);
  }, [persistToken]);

  const logout = useCallback(() => {
    const guest = createGuestProfile();
    saveLocalProfile(guest);
    setProfile(guest);
    setUser(null);
    persistToken(null);
  }, [persistToken]);

  const syncLanguage = useCallback(
    (locale: LocaleCode) => {
      setLocale(locale);
      const next = { ...profile, language: locale, updatedAt: new Date().toISOString() };
      saveLocalProfile(next);
      setProfile(next);
      if (token) {
        api.patchMe(token, { language: locale }).catch(() => undefined);
      }
    },
    [profile, token],
  );

  const value = useMemo(
    () => ({ profile, user, token, loading, error, login, register, continueAsGuest, logout, syncLanguage }),
    [profile, user, token, loading, error, login, register, continueAsGuest, logout, syncLanguage],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
