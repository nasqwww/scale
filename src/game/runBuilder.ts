import { dailyChallenge, ROUNDS_PER_RUN, scaleObjects } from '../data/scaleObjects';
import type { GameMode, ScaleObject } from '../types';

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

function poolForMode(mode: GameMode): ScaleObject[] {
  if (mode === 'cosmic') {
    return scaleObjects.filter(
      (object) =>
        object.category.toLowerCase().includes('cosmic') ||
        object.category.toLowerCase().includes('space') ||
        object.exactMeters >= 100_000,
    );
  }

  if (mode === 'hardcore') {
    return scaleObjects.filter((object) => object.difficulty >= 3);
  }

  return scaleObjects;
}

export function roundCountForMode(mode: GameMode) {
  if (mode === 'quick') return 5;
  if (mode === 'speed') return 6;
  return ROUNDS_PER_RUN;
}

export function buildRun(mode: GameMode, seed = dailyChallenge.getSeed()): ScaleObject[] {
  const random = mulberry32(hashSeed(`${mode}-${seed}`));
  const pool = poolForMode(mode);
  const count = roundCountForMode(mode);

  return [...pool]
    .map((object) => ({ object, order: random() + object.difficulty * (mode === 'hardcore' ? 0.04 : 0.015) }))
    .sort((a, b) => a.order - b.order)
    .slice(0, count)
    .map(({ object }) => object);
}

export function runSeedForMode(mode: GameMode, customSeed?: string) {
  if (mode === 'daily') return dailyChallenge.getSeed();
  return customSeed ?? `${mode}-${Date.now()}`;
}
