import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import * as sound from '../lib/sound';

interface AudioContextValue {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  unlock: () => void;
  playMenuAmbient: () => void;
  playSliderTick: () => void;
  playTension: () => () => void;
  playReveal: (intensity: number) => void;
  playScorePop: (legendary: boolean) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);
const STORAGE_KEY = 'scale.audio.v1';

export function AudioProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(() => localStorage.getItem(STORAGE_KEY) !== 'false');

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
  }, []);

  const guard = useCallback(
    <T extends (...args: never[]) => void>(fn: T) =>
      ((...args: Parameters<T>) => {
        if (!enabled) return;
        fn(...args);
      }) as T,
    [enabled],
  );

  const value = useMemo<AudioContextValue>(
    () => ({
      enabled,
      setEnabled,
      unlock: sound.unlockAudio,
      playMenuAmbient: guard(sound.playMenuAmbient),
      playSliderTick: guard(sound.playSliderTick),
      playTension: guard(sound.playTensionBuild),
      playReveal: guard(sound.playRevealSound),
      playScorePop: guard(sound.playScorePop),
    }),
    [enabled, setEnabled, guard],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
