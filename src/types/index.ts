export type GamePhase = 'guessing' | 'charging' | 'revealed' | 'complete';

export type AppScreen =
  | 'loading'
  | 'menu'
  | 'gameplay'
  | 'leaderboard'
  | 'profile'
  | 'friends'
  | 'collection'
  | 'achievements'
  | 'settings'
  | 'about'
  | 'auth'
  | 'admin'
  | 'multiplayer';

export type GameMode =
  | 'quick'
  | 'daily'
  | 'endless'
  | 'hardcore'
  | 'cosmic'
  | 'speed'
  | 'duel'
  | 'classic';

export type LocaleCode = 'en' | 'ru' | 'de' | 'es' | 'ja';

export type PlayerMode = 'guest' | 'registered';

export type LeaderboardScope = 'global' | 'daily' | 'seasonal' | 'country' | 'friends';

export type PrecisionBand =
  | 'impossible'
  | 'surgical'
  | 'near'
  | 'strong'
  | 'rough'
  | 'miss'
  | 'lost';

export type MeasurementAxis = 'height' | 'length' | 'diameter' | 'span';

export interface ScaleImage {
  src: string;
  fallbacks: string[];
  alt: string;
  sourceUrl: string;
  credit: string;
  focalPoint?: string;
  local?: boolean;
}

export interface ScaleComparison {
  label: string;
  meters: number;
  singular: string;
  plural: string;
}

export interface ScaleObject {
  id: string;
  name: string;
  category: string;
  axis: MeasurementAxis;
  exactMeters: number;
  minGuessMeters: number;
  maxGuessMeters: number;
  prompt: string;
  intro: string;
  revealLine: string;
  shockFact: string;
  crowdBias?: 'underestimate' | 'overestimate' | 'split';
  image: ScaleImage;
  comparisons: ScaleComparison[];
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface ScoreBreakdown {
  points: number;
  basePoints: number;
  streakBonus: number;
  multiplier: number;
  percentError: number;
  ratioError: number;
  logError: number;
  band: PrecisionBand;
  verdict: string;
  legendary?: boolean;
}

export interface RoundResult extends ScoreBreakdown {
  objectId: string;
  objectName: string;
  guessMeters: number;
  correctMeters: number;
  comparisonLine: string;
  crowdLine?: string;
  createdAt: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  roundsPlayed: number;
  totalScore: number;
  bestScore: number;
  bestStreak: number;
  nearPerfects: number;
  perfects: number;
  averagePercentError: number;
  favoriteCategory?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
  language?: LocaleCode;
  avatarUrl?: string;
}

export interface PlayerProfile {
  uid: string;
  mode: PlayerMode;
  displayName: string;
  username?: string;
  photoURL?: string;
  bestScore: number;
  stats: PlayerStats;
  history: GameSessionSummary[];
  createdAt: string;
  updatedAt: string;
  language: LocaleCode;
  token?: string;
  role?: string;
}

export interface GameSessionSummary {
  id: string;
  score: number;
  rank: string;
  bestStreak: number;
  nearPerfects: number;
  averagePercentError: number;
  createdAt: string;
  dailySeed?: string;
  mode?: GameMode;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  score: number;
  rank: string;
  createdAt: string;
  scope: LeaderboardScope;
  countryCode?: string;
}

export interface FriendSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  online: boolean;
  bestScore: number;
}
