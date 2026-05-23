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

function bandFromError(percentError: number, ratioError: number): PrecisionBand {
  if (percentError <= 0.01) return 'impossible';
  if (percentError <= 0.03) return 'surgical';
  if (percentError <= 0.08) return 'near';
  if (percentError <= 0.18) return 'strong';
  if (ratioError <= 1.75) return 'rough';
  if (ratioError <= 3) return 'miss';
  return 'lost';
}

export function scoreGuess(guessMeters: number, correctMeters: number, currentStreak: number): ScoreBreakdown {
  const safeGuess = Math.max(guessMeters, 0.000001);
  const ratioError = Math.max(safeGuess / correctMeters, correctMeters / safeGuess);
  const percentError = Math.abs(safeGuess - correctMeters) / correctMeters;
  const logError = Math.abs(Math.log2(safeGuess / correctMeters));
  const band = bandFromError(percentError, ratioError);

  const baseCurve = Math.exp(-2.18 * Math.pow(logError, 1.34));
  const basePoints = Math.round(1000 * baseCurve);
  const precisionBonus = band === 'impossible' ? 260 : band === 'surgical' ? 150 : band === 'near' ? 70 : 0;
  const eligibleForCombo = band === 'impossible' || band === 'surgical' || band === 'near' || band === 'strong';
  const multiplier = eligibleForCombo ? 1 + Math.min(currentStreak, 6) * 0.075 : 1;
  const streakBonus = Math.round((basePoints + precisionBonus) * (multiplier - 1));
  const points = Math.max(0, Math.min(1260, Math.round((basePoints + precisionBonus) * multiplier)));

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
  };
}

export function nextStreakForBand(band: PrecisionBand, currentStreak: number): number {
  return band === 'impossible' || band === 'surgical' || band === 'near' || band === 'strong'
    ? currentStreak + 1
    : 0;
}

export function rankForScore(score: number, maxScore: number): string {
  const ratio = score / maxScore;

  if (ratio >= 0.94) return 'Mythic Calibration';
  if (ratio >= 0.86) return 'Scale Savant';
  if (ratio >= 0.76) return 'Elite Surveyor';
  if (ratio >= 0.64) return 'Field Analyst';
  if (ratio >= 0.5) return 'Human Ruler';
  if (ratio >= 0.34) return 'Depth Learner';
  return 'Uncalibrated';
}
