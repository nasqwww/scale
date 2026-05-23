import type { GameSessionSummary, LocaleCode, PlayerProfile, PlayerStats, RoundResult } from '../types';

const STORAGE_KEY = 'scale.profile.v2';
const HISTORY_LIMIT = 25;

const blankStats: PlayerStats = {
  gamesPlayed: 0,
  roundsPlayed: 0,
  totalScore: 0,
  bestScore: 0,
  bestStreak: 0,
  nearPerfects: 0,
  perfects: 0,
  averagePercentError: 0,
};

function now() {
  return new Date().toISOString();
}

function createGuestId() {
  const existing = localStorage.getItem('scale.guestId');
  if (existing) return existing;
  const id = `guest-${crypto.randomUUID()}`;
  localStorage.setItem('scale.guestId', id);
  return id;
}

export function createGuestProfile(): PlayerProfile {
  const createdAt = now();
  const language = (localStorage.getItem('scale.locale.v1') as LocaleCode) || 'en';

  return {
    uid: createGuestId(),
    mode: 'guest',
    displayName: 'Guest',
    bestScore: 0,
    stats: { ...blankStats },
    history: [],
    createdAt,
    updatedAt: createdAt,
    language,
  };
}

export function loadLocalProfile(): PlayerProfile {
  const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('scale.profile.v1');
  if (!raw) {
    const profile = createGuestProfile();
    saveLocalProfile(profile);
    return profile;
  }

  try {
    const parsed = JSON.parse(raw) as PlayerProfile;
    return { ...createGuestProfile(), ...parsed, stats: { ...blankStats, ...parsed.stats } };
  } catch {
    const profile = createGuestProfile();
    saveLocalProfile(profile);
    return profile;
  }
}

export function saveLocalProfile(profile: PlayerProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export async function persistProfile(profile: PlayerProfile) {
  saveLocalProfile({ ...profile, updatedAt: now() });
}

export async function recordGameSession(
  profile: PlayerProfile,
  session: GameSessionSummary,
  results: RoundResult[],
): Promise<PlayerProfile> {
  const totalRounds = profile.stats.roundsPlayed + results.length;
  const priorErrorTotal = profile.stats.averagePercentError * profile.stats.roundsPlayed;
  const newErrorTotal = results.reduce((sum, result) => sum + result.percentError, 0);
  const perfects = results.filter((result) => result.band === 'impossible').length;
  const nearPerfects = results.filter((result) => ['impossible', 'surgical', 'near'].includes(result.band)).length;

  const next: PlayerProfile = {
    ...profile,
    bestScore: Math.max(profile.bestScore, session.score),
    stats: {
      gamesPlayed: profile.stats.gamesPlayed + 1,
      roundsPlayed: totalRounds,
      totalScore: profile.stats.totalScore + session.score,
      bestScore: Math.max(profile.stats.bestScore, session.score),
      bestStreak: Math.max(profile.stats.bestStreak, session.bestStreak),
      nearPerfects: profile.stats.nearPerfects + nearPerfects,
      perfects: profile.stats.perfects + perfects,
      averagePercentError: totalRounds > 0 ? (priorErrorTotal + newErrorTotal) / totalRounds : 0,
    },
    history: [session, ...profile.history].slice(0, HISTORY_LIMIT),
    updatedAt: now(),
  };

  await persistProfile(next);
  return next;
}
