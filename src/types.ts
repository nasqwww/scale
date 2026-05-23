export type GamePhase = 'guessing' | 'charging' | 'revealed' | 'complete';

export type PlayerMode = 'guest' | 'google';

export type LeaderboardScope = 'global' | 'daily' | 'friends';

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
}

export interface RoundResult extends ScoreBreakdown {
  objectId: string;
  objectName: string;
  guessMeters: number;
  correctMeters: number;
  comparisonLine: string;
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
}

export interface PlayerProfile {
  uid: string;
  mode: PlayerMode;
  displayName: string;
  photoURL?: string;
  bestScore: number;
  stats: PlayerStats;
  history: GameSessionSummary[];
  createdAt: string;
  updatedAt: string;
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
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  score: number;
  rank: string;
  createdAt: string;
  scope: LeaderboardScope;
}
