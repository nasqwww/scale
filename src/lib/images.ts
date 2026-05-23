import type { ScaleImage, ScaleObject } from '../types';

/** Prefer curated local WebP; fall back to remote Wikimedia sources. */
export function resolveObjectImage(object: ScaleObject): ScaleImage {
  const localSrc = `/images/objects/${object.id}.webp`;
  const remote = object.image;

  return {
    ...remote,
    src: remote.local ? remote.src : localSrc,
    fallbacks: remote.local ? remote.fallbacks : [remote.src, ...remote.fallbacks],
    local: true,
  };
}

export function imageSources(image: ScaleImage) {
  return [image.src, ...image.fallbacks.filter((src) => src !== image.src)];
}
