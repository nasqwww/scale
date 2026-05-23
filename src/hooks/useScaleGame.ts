import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildRun, runSeedForMode, roundCountForMode } from '../game/runBuilder';
import { describeComparison, describeCrowdBias } from '../lib/format';
import { preloadObjectImages } from '../lib/preload';
import { maxRunScore, nextStreakForBand, rankForScore, scoreGuess } from '../lib/scoring';
import type { GameMode, GamePhase, GameSessionSummary, RoundResult } from '../types';

const CHARGE_MS = 920;
const SPEED_ROUND_MS = 22_000;

export function useScaleGame(mode: GameMode) {
  const [runSeed, setRunSeed] = useState(() => runSeedForMode(mode));
  const [rounds, setRounds] = useState(() => buildRun(mode, runSeed));
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('guessing');
  const [guessMeters, setGuessMeters] = useState(() => rounds[0].exactMeters * 0.75);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isPreloading, setIsPreloading] = useState(true);
  const [timeLeftMs, setTimeLeftMs] = useState(mode === 'speed' ? SPEED_ROUND_MS : 0);

  const currentObject = rounds[roundIndex];
  const roundCount = rounds.length;
  const totalScore = results.reduce((sum, result) => sum + result.points, 0);
  const maxScore = maxRunScore(roundCountForMode(mode));
  const latestResult = results[results.length - 1];

  useEffect(() => {
    const seed = runSeedForMode(mode);
    const nextRounds = buildRun(mode, seed);
    setRunSeed(seed);
    setRounds(nextRounds);
    setRoundIndex(0);
    setPhase('guessing');
    setGuessMeters(nextRounds[0].exactMeters * 0.75);
    setResults([]);
    setStreak(0);
    setBestStreak(0);
    setTimeLeftMs(mode === 'speed' ? SPEED_ROUND_MS : 0);
  }, [mode]);

  useEffect(() => {
    setIsPreloading(true);
    preloadObjectImages(rounds.slice(roundIndex, roundIndex + 3)).finally(() => setIsPreloading(false));
  }, [roundIndex, rounds]);

  useEffect(() => {
    if (mode !== 'speed' || phase !== 'guessing') return;

    const started = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - started;
      const remaining = Math.max(0, SPEED_ROUND_MS - elapsed);
      setTimeLeftMs(remaining);
      if (remaining <= 0) {
        window.clearInterval(timer);
        lockGuess();
      }
    }, 120);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, phase, roundIndex, currentObject?.id]);

  const lockGuess = useCallback(() => {
    if (phase !== 'guessing') return;

    setPhase('charging');
    const chargeDelay = mode === 'hardcore' ? 560 : CHARGE_MS;

    window.setTimeout(() => {
      const score = scoreGuess(guessMeters, currentObject.exactMeters, streak);
      const nextStreak = nextStreakForBand(score.band, streak);
      const result: RoundResult = {
        ...score,
        objectId: currentObject.id,
        objectName: currentObject.name,
        guessMeters,
        correctMeters: currentObject.exactMeters,
        comparisonLine: describeComparison(currentObject.exactMeters, currentObject.comparisons),
        crowdLine: describeCrowdBias(currentObject),
        createdAt: new Date().toISOString(),
      };

      setResults((existing) => [...existing, result]);
      setStreak(nextStreak);
      setBestStreak((existing) => Math.max(existing, nextStreak));

      if (mode === 'endless' && !['impossible', 'surgical', 'near', 'strong'].includes(score.band)) {
        setPhase('complete');
        return;
      }

      setPhase('revealed');
    }, chargeDelay);
  }, [currentObject, guessMeters, mode, phase, streak]);

  const nextRound = useCallback(() => {
    if (roundIndex >= rounds.length - 1) {
      setPhase('complete');
      return;
    }

    const nextIndex = roundIndex + 1;
    setRoundIndex(nextIndex);
    setGuessMeters(rounds[nextIndex].exactMeters * (0.65 + (nextIndex % 3) * 0.25));
    setPhase('guessing');
    setTimeLeftMs(mode === 'speed' ? SPEED_ROUND_MS : 0);
  }, [mode, roundIndex, rounds]);

  const restart = useCallback(() => {
    const seed = runSeedForMode(mode, `${runSeed}-${Date.now()}`);
    const nextRounds = buildRun(mode, seed);
    setRunSeed(seed);
    setRounds(nextRounds);
    setRoundIndex(0);
    setPhase('guessing');
    setGuessMeters(nextRounds[0].exactMeters * 0.75);
    setResults([]);
    setStreak(0);
    setBestStreak(0);
    setTimeLeftMs(mode === 'speed' ? SPEED_ROUND_MS : 0);
  }, [mode, runSeed]);

  const sessionSummary = useMemo<GameSessionSummary | null>(() => {
    if (phase !== 'complete') return null;

    const nearPerfects = results.filter((result) => ['impossible', 'surgical', 'near'].includes(result.band)).length;
    const averagePercentError = results.reduce((sum, result) => sum + result.percentError, 0) / Math.max(results.length, 1);

    return {
      id: crypto.randomUUID(),
      score: totalScore,
      rank: rankForScore(totalScore, maxScore),
      bestStreak,
      nearPerfects,
      averagePercentError,
      createdAt: new Date().toISOString(),
      dailySeed: mode === 'daily' ? runSeed : undefined,
      mode,
    };
  }, [bestStreak, maxScore, mode, phase, results, runSeed, totalScore]);

  return {
    mode,
    rounds,
    currentObject,
    roundIndex,
    roundCount,
    phase,
    guessMeters,
    setGuessMeters,
    totalScore,
    maxScore,
    streak,
    bestStreak,
    results,
    latestResult,
    isPreloading,
    timeLeftMs,
    lockGuess,
    nextRound,
    restart,
    sessionSummary,
  };
}
