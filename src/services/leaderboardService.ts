import { api } from './api';
import type { GameSessionSummary, LeaderboardScope, PlayerProfile } from '../types';

export async function submitLeaderboardEntry(
  profile: PlayerProfile,
  session: GameSessionSummary,
  scope: LeaderboardScope = 'global',
) {
  if (!profile.token) {
    cacheLocalEntry(profile, session, scope);
    return;
  }

  try {
    await api.submitLeaderboard(profile.token, {
      score: session.score,
      rankLabel: session.rank,
      scope,
    });
  } catch (error) {
    console.error(error);
    cacheLocalEntry(profile, session, scope);
  }
}

function cacheLocalEntry(profile: PlayerProfile, session: GameSessionSummary, scope: LeaderboardScope) {
  const key = `scale.leaderboard.${scope}.v1`;
  const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[];
  const entry = {
    uid: profile.uid,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    score: session.score,
    rank: session.rank,
    createdAt: session.createdAt,
    scope,
  };
  localStorage.setItem(key, JSON.stringify([entry, ...existing].slice(0, 50)));
}

export function loadLocalLeaderboard(scope: LeaderboardScope) {
  const key = `scale.leaderboard.${scope}.v1`;
  return JSON.parse(localStorage.getItem(key) ?? '[]') as Array<{
    displayName: string;
    score: number;
    rank: string;
    createdAt: string;
  }>;
}

export async function fetchLeaderboard(scope: LeaderboardScope, token?: string) {
  try {
    const payload = await api.leaderboard(scope, token);
    return payload.entries as Array<Record<string, unknown>>;
  } catch {
    return loadLocalLeaderboard(scope);
  }
}
