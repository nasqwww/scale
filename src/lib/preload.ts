import type { ScaleObject } from '../types';

const cache = new Map<string, Promise<void>>();

function loadImage(src: string): Promise<void> {
  if (cache.has(src)) {
    return cache.get(src)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Image failed: ${src}`));
    image.src = src;
  });

  cache.set(src, promise);
  return promise;
}

export function imageSourcesForObject(object: ScaleObject): string[] {
  return [object.image.src, ...object.image.fallbacks].filter(Boolean);
}

export function preloadObjectImages(objects: ScaleObject[]): Promise<void[]> {
  return Promise.all(objects.flatMap(imageSourcesForObject).map((src) => loadImage(src).catch(() => undefined)));
}
