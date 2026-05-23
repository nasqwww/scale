import { useCallback, useEffect, useMemo, useState } from 'react';
import { dailyChallenge, ROUNDS_PER_RUN, scaleObjects } from '../data/scaleObjects';
import { describeComparison } from '../lib/format';
import { preloadObjectImages } from '../lib/preload';
import { nextStreakForBand, rankForScore, scoreGuess } from '../lib/scoring';
import type { GamePhase, GameSessionSummary, RoundResult, ScaleObject } from '../types';

function hashSeed(seed: string): number {
  return [...seed].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
}

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function curatedRun(seed = dailyChallenge.getSeed()): ScaleObject[] {
  const random = mulberry32(hashSeed(seed));
  return [...scaleObjects]
    .map((object) => ({ object, order: random() + object.difficulty * 0.015 }))
    .sort((a, b) => a.order - b.order)
    .slice(0, ROUNDS_PER_RUN)
    .map(({ object }) => object);
}

export function useScaleGame() {
  const [dailySeed] = useState(() => dailyChallenge.getSeed());
  const [rounds, setRounds] = useState(() => curatedRun(dailySeed));
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('guessing');
  const [guessMeters, setGuessMeters] = useState(() => rounds[0].exactMeters * 0.75);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isPreloading, setIsPreloading] = useState(true);

  const currentObject = rounds[roundIndex];
  const totalScore = results.reduce((sum, result) => sum + result.points, 0);
  const maxScore = ROUNDS_PER_RUN * 1260;
  const latestResult = results[results.length - 1];

  useEffect(() => {
    setIsPreloading(true);
    preloadObjectImages(rounds.slice(roundIndex, roundIndex + 3)).finally(() => setIsPreloading(false));
  }, [roundIndex, rounds]);

  const lockGuess = useCallback(() => {
    if (phase !== 'guessing') return;

    setPhase('charging');
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
        createdAt: new Date().toISOString(),
      };

      setResults((existing) => [...existing, result]);
      setStreak(nextStreak);
      setBestStreak((existing) => Math.max(existing, nextStreak));
      setPhase('revealed');
    }, 720);
  }, [currentObject, guessMeters, phase, streak]);

  const nextRound = useCallback(() => {
    if (roundIndex >= rounds.length - 1) {
      setPhase('complete');
      return;
    }

    const nextIndex = roundIndex + 1;
    setRoundIndex(nextIndex);
    setGuessMeters(rounds[nextIndex].exactMeters * (0.65 + (nextIndex % 3) * 0.25));
    setPhase('guessing');
  }, [roundIndex, rounds]);

  const restart = useCallback(() => {
    const seed = `${dailySeed}-${Date.now()}`;
    const nextRounds = curatedRun(seed);
    setRounds(nextRounds);
    setRoundIndex(0);
    setPhase('guessing');
    setGuessMeters(nextRounds[0].exactMeters * 0.75);
    setResults([]);
    setStreak(0);
    setBestStreak(0);
  }, [dailySeed]);

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
      dailySeed,
    };
  }, [bestStreak, dailySeed, maxScore, phase, results, totalScore]);

  return {
    rounds,
    currentObject,
    roundIndex,
    roundCount: rounds.length,
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
    lockGuess,
    nextRound,
    restart,
    sessionSummary,
  };
}
