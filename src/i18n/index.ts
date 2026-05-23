import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { LocaleCode } from '../types';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import ja from './locales/ja.json';
import ru from './locales/ru.json';

export const LOCALES: { code: LocaleCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
];

const bundles = { en, ru, de, es, ja } as const;

const STORAGE_KEY = 'scale.locale.v1';

type Dictionary = typeof en;

let locale: LocaleCode = (localStorage.getItem(STORAGE_KEY) as LocaleCode) || 'en';
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getLocale() {
  return locale;
}

export function setLocale(next: LocaleCode) {
  locale = next;
  localStorage.setItem(STORAGE_KEY, next);
  notify();
}

function getByPath(obj: Record<string, unknown>, path: string): string | undefined {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as string | undefined;
}

export function translate(key: string, lang = locale): string {
  const value = getByPath(bundles[lang] as Record<string, unknown>, key);
  if (value) return value;
  return getByPath(bundles.en as Record<string, unknown>, key) ?? key;
}

export function useI18n() {
  const current = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => locale,
    () => locale,
  );

  const t = useCallback((key: string) => translate(key, current), [current]);

  return useMemo(
    () => ({
      locale: current,
      t,
      setLocale: (next: LocaleCode) => {
        setLocale(next);
      },
    }),
    [current, t],
  );
}

export type { Dictionary };
