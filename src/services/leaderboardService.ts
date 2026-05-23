import { collection, limit, orderBy, query, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { firebase } from '../lib/firebase';
import type { GameSessionSummary, LeaderboardEntry, LeaderboardScope, PlayerProfile } from '../types';

export interface LeaderboardQuery {
  scope: LeaderboardScope;
  dailySeed?: string;
  friendIds?: string[];
  limit: number;
}

export function leaderboardPath(scope: LeaderboardScope, dailySeed?: string): string {
  if (scope === 'daily') {
    return `leaderboards/daily-${dailySeed ?? 'today'}/entries`;
  }

  if (scope === 'friends') {
    return 'leaderboards/friends/entries';
  }

  return 'leaderboards/global/entries';
}

export async function submitLeaderboardEntry(
  profile: PlayerProfile,
  session: GameSessionSummary,
  scope: LeaderboardScope = 'global',
) {
  if (!firebase.db || profile.mode !== 'google') {
    return;
  }

  const entry: LeaderboardEntry = {
    uid: profile.uid,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    score: session.score,
    rank: session.rank,
    createdAt: session.createdAt,
    scope,
  };

  const path = leaderboardPath(scope, session.dailySeed);
  await setDoc(doc(firebase.db, path, profile.uid), { ...entry, updatedAt: serverTimestamp() }, { merge: true });
}

export function buildLeaderboardQuery({ scope, dailySeed, limit: entryLimit }: LeaderboardQuery) {
  if (!firebase.db) {
    return null;
  }

  return query(collection(firebase.db, leaderboardPath(scope, dailySeed)), orderBy('score', 'desc'), limit(entryLimit));
}
