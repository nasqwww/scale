import type { ScaleObject } from '../types';
import { imageSources, resolveObjectImage } from './images';

const cache = new Map<string, Promise<void>>();

function loadImage(src: string): Promise<void> {
  if (cache.has(src)) {
    return cache.get(src)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Image failed: ${src}`));
    image.src = src;
  });

  cache.set(src, promise);
  return promise;
}

export function imageSourcesForObject(object: ScaleObject): string[] {
  return imageSources(resolveObjectImage(object));
}

export function preloadObjectImages(objects: ScaleObject[]): Promise<void[]> {
  const unique = [...new Set(objects.flatMap(imageSourcesForObject))];
  return Promise.all(unique.map((src) => loadImage(src).catch(() => undefined)));
}

export async function preloadBootAssets(objects: ScaleObject[], onProgress: (value: number) => void) {
  const sources = [...new Set(objects.flatMap(imageSourcesForObject))];
  if (!sources.length) {
    onProgress(1);
    return;
  }

  let loaded = 0;
  await Promise.all(
    sources.map(async (src) => {
      try {
        await loadImage(src);
      } catch {
        /* fallback chain handles runtime */
      } finally {
        loaded += 1;
        onProgress(loaded / sources.length);
      }
    }),
  );
}
