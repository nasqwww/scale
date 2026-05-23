import type { PrecisionBand, ScoreBreakdown } from '../types';

const verdicts: Record<PrecisionBand, string> = {
  impossible: 'Impossible calibration',
  surgical: 'Surgical read',
  near: 'Near-perfect lock',
  strong: 'Strong estimate',
  rough: 'Rough but alive',
  miss: 'Scale drift',
  lost: 'Reality rupture',
};

const MAX_ROUND_POINTS = 1050;

function bandFromError(percentError: number, ratioError: number): PrecisionBand {
  if (percentError <= 0.005) return 'impossible';
  if (percentError <= 0.02) return 'surgical';
  if (percentError <= 0.055) return 'near';
  if (percentError <= 0.14) return 'strong';
  if (ratioError <= 1.55) return 'rough';
  if (ratioError <= 2.4) return 'miss';
  return 'lost';
}

export function scoreGuess(guessMeters: number, correctMeters: number, currentStreak: number): ScoreBreakdown {
  const safeGuess = Math.max(guessMeters, 0.000001);
  const ratioError = Math.max(safeGuess / correctMeters, correctMeters / safeGuess);
  const percentError = Math.abs(safeGuess - correctMeters) / correctMeters;
  const logError = Math.abs(Math.log2(safeGuess / correctMeters));
  const band = bandFromError(percentError, ratioError);

  const baseCurve = Math.exp(-3.05 * Math.pow(logError, 1.52));
  const basePoints = Math.round(820 * baseCurve);
  const precisionBonus =
    band === 'impossible' ? 220 : band === 'surgical' ? 120 : band === 'near' ? 45 : band === 'strong' ? 12 : 0;
  const eligibleForCombo = band === 'impossible' || band === 'surgical' || band === 'near';
  const multiplier = eligibleForCombo ? 1 + Math.min(currentStreak, 5) * 0.06 : 1;
  const streakBonus = Math.round((basePoints + precisionBonus) * (multiplier - 1));
  const points = Math.max(0, Math.min(MAX_ROUND_POINTS, Math.round((basePoints + precisionBonus) * multiplier)));
  const legendary = band === 'impossible';

  return {
    points,
    basePoints,
    streakBonus,
    multiplier,
    percentError,
    ratioError,
    logError,
    band,
    verdict: verdicts[band],
    legendary,
  };
}

export function nextStreakForBand(band: PrecisionBand, currentStreak: number): number {
  return band === 'impossible' || band === 'surgical' || band === 'near' ? currentStreak + 1 : 0;
}

export function rankForScore(score: number, maxScore: number): string {
  const ratio = score / maxScore;

  if (ratio >= 0.96) return 'Mythic Calibration';
  if (ratio >= 0.88) return 'Scale Savant';
  if (ratio >= 0.78) return 'Elite Surveyor';
  if (ratio >= 0.66) return 'Field Analyst';
  if (ratio >= 0.52) return 'Human Ruler';
  if (ratio >= 0.36) return 'Depth Learner';
  return 'Uncalibrated';
}

export function maxRunScore(roundCount: number) {
  return roundCount * MAX_ROUND_POINTS;
}
