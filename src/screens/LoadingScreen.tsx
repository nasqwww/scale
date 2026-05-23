import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { scaleObjects } from '../data/scaleObjects';
import { useAudio } from '../context/AudioContext';
import { useI18n } from '../i18n';
import { preloadBootAssets } from '../lib/preload';
import { Particles } from '../components/ui/Particles';

interface LoadingScreenProps {
  onReady: () => void;
}

const messages = ['loading.calibrating', 'loading.syncing', 'loading.ready'] as const;

export function LoadingScreen({ onReady }: LoadingScreenProps) {
  const { t } = useI18n();
  const audio = useAudio();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    audio.unlock();
    let cancelled = false;

    preloadBootAssets(scaleObjects.slice(0, 10), (value) => {
      if (!cancelled) setProgress(value);
    }).then(() => {
      if (!cancelled) {
        setProgress(1);
        window.setTimeout(onReady, 520);
      }
    });

    const msgTimer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % messages.length);
    }, 1100);

    return () => {
      cancelled = true;
      window.clearInterval(msgTimer);
    };
  }, [audio, onReady]);

  return (
    <div className="loading-screen">
      <Particles count={36} />
      <motion.div
        className="scale-logo"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="scale-logo-ring" />
        <span className="scale-logo-core">SCALE</span>
      </motion.div>
      <p className="loading-tagline">{t('tagline')}</p>
      <p className="loading-status">{t(messages[messageIndex])}</p>
      <div className="loading-track">
        <motion.div className="loading-fill" animate={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <p className="loading-percent">{Math.round(progress * 100)}%</p>
    </div>
  );
}
