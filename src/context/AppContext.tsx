import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AppScreen, GameMode } from '../types';

interface AppNavigation {
  screen: AppScreen;
  mode: GameMode;
  navigate: (screen: AppScreen) => void;
  startMode: (mode: GameMode) => void;
}

const AppContext = createContext<AppNavigation | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<AppScreen>('loading');
  const [mode, setMode] = useState<GameMode>('classic');

  const navigate = useCallback((next: AppScreen) => setScreen(next), []);

  const startMode = useCallback((nextMode: GameMode) => {
    setMode(nextMode);
    setScreen('gameplay');
  }, []);

  const value = useMemo(() => ({ screen, mode, navigate, startMode }), [screen, mode, navigate, startMode]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
