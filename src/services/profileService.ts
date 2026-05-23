import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { firebase } from '../lib/firebase';
import type { GameSessionSummary, PlayerProfile, PlayerStats, RoundResult } from '../types';

const STORAGE_KEY = 'scale.profile.v1';
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

  return {
    uid: createGuestId(),
    mode: 'guest',
    displayName: 'Guest',
    bestScore: 0,
    stats: { ...blankStats },
    history: [],
    createdAt,
    updatedAt: createdAt,
  };
}

export function loadLocalProfile(): PlayerProfile {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const profile = createGuestProfile();
    saveLocalProfile(profile);
    return profile;
  }

  try {
    return { ...createGuestProfile(), ...JSON.parse(raw) };
  } catch {
    const profile = createGuestProfile();
    saveLocalProfile(profile);
    return profile;
  }
}

export function saveLocalProfile(profile: PlayerProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export async function profileFromGoogleUser(user: User): Promise<PlayerProfile> {
  const local = loadLocalProfile();
  const base: PlayerProfile = {
    ...local,
    uid: user.uid,
    mode: 'google',
    displayName: user.displayName ?? 'Google Player',
    photoURL: user.photoURL ?? undefined,
    updatedAt: now(),
  };

  if (!firebase.db) {
    saveLocalProfile(base);
    return base;
  }

  const ref = doc(firebase.db, 'players', user.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    const cloud = snapshot.data() as PlayerProfile;
    const merged = {
      ...base,
      ...cloud,
      displayName: user.displayName ?? cloud.displayName ?? base.displayName,
      photoURL: user.photoURL ?? cloud.photoURL,
      updatedAt: now(),
    };
    saveLocalProfile(merged);
    return merged;
  }

  await setDoc(ref, base, { merge: true });
  saveLocalProfile(base);
  return base;
}

export async function persistProfile(profile: PlayerProfile) {
  const next = { ...profile, updatedAt: now() };
  saveLocalProfile(next);

  if (firebase.db && next.mode === 'google') {
    await setDoc(doc(firebase.db, 'players', next.uid), next, { merge: true });
  }
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
