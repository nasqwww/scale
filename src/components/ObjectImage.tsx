import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import type { ScaleObject } from '../types';
import { imageSources, resolveObjectImage } from '../lib/images';

interface ObjectImageProps {
  object: ScaleObject;
  revealed: boolean;
}

export function ObjectImage({ object, revealed }: ObjectImageProps) {
  const resolved = useMemo(() => resolveObjectImage(object), [object]);
  const sources = useMemo(() => imageSources(resolved), [resolved]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSourceIndex(0);
    setLoaded(false);
    setFailed(false);
  }, [object.id]);

  const source = sources[sourceIndex];

  return (
    <div className="image-shell">
      {!loaded && !failed ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-black/30">
          <div className="measurement-loader">
            <span />
            <span />
            <span />
          </div>
        </div>
      ) : null}

      {failed ? (
        <div className="fallback-image">
          <ImageOff size={34} />
          <div>
            <p className="kicker">{object.category}</p>
            <p>{object.name}</p>
          </div>
        </div>
      ) : (
        <motion.img
          key={source}
          src={source}
          alt={resolved.alt}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: resolved.focalPoint ?? '50% 50%' }}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: revealed ? 1.02 : 1, opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (sourceIndex < sources.length - 1) {
              setSourceIndex((index) => index + 1);
              setLoaded(false);
            } else {
              setFailed(true);
            }
          }}
        />
      )}

      <div className="image-overlays" />
      <motion.div
        className="target-reticle"
        animate={{ opacity: revealed ? 0.82 : 0.36, scale: revealed ? 1.05 : 1 }}
        transition={{ duration: 0.5 }}
      />
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div>
          <p className="kicker">{object.category}</p>
          <h2 className="max-w-[760px] text-balance text-3xl font-semibold text-white sm:text-5xl lg:text-6xl">
            {object.name}
          </h2>
        </div>
      </div>
    </div>
  );
}
