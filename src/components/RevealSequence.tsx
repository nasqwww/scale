import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Gauge, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useI18n } from '../i18n';
import { axisCopy, formatMeters, formatPercent } from '../lib/format';
import type { RoundResult, ScaleObject } from '../types';

interface RevealSequenceProps {
  object: ScaleObject;
  result: RoundResult;
  isFinalRound: boolean;
  onNext: () => void;
}

type RevealStage = 'pause' | 'tension' | 'bars' | 'score' | 'facts' | 'ready';

function barPercent(value: number, max: number) {
  return `${Math.max(7, Math.min(100, (value / max) * 100))}%`;
}

export function RevealSequence({ object, result, isFinalRound, onNext }: RevealSequenceProps) {
  const { t } = useI18n();
  const audio = useAudio();
  const [stage, setStage] = useState<RevealStage>('pause');
  const max = Math.max(result.guessMeters, result.correctMeters);
  const precise = result.band === 'impossible' || result.band === 'surgical' || result.band === 'near';

  useEffect(() => {
    setStage('pause');
    const stopTension = audio.playTension();
    const timeline = [
      window.setTimeout(() => setStage('tension'), 180),
      window.setTimeout(() => setStage('bars'), 720),
      window.setTimeout(() => {
        setStage('score');
        audio.playScorePop(Boolean(result.legendary));
        audio.playReveal(Math.max(0.2, 1 - Math.min(result.logError, 1.5) / 1.5));
      }, 1180),
      window.setTimeout(() => setStage('facts'), 1680),
      window.setTimeout(() => setStage('ready'), 2280),
    ];

    return () => {
      stopTension?.();
      timeline.forEach((timer) => window.clearTimeout(timer));
    };
  }, [result.objectId, audio, result.legendary, result.logError]);

  return (
    <motion.section
      className="reveal-panel reveal-sequence"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
    >
      <AnimatePresence mode="wait">
        {stage === 'pause' || stage === 'tension' ? (
          <motion.div
            key="tension"
            className="reveal-tension"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="charging-core" />
            <span>{stage === 'pause' ? '…' : t('game.charging')}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {(stage === 'bars' || stage === 'score' || stage === 'facts' || stage === 'ready') && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="kicker">{t('reveal.lock')}</p>
              <h3 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{result.verdict}</h3>
            </div>
            <AnimatePresence>
              {(stage === 'score' || stage === 'facts' || stage === 'ready') && (
                <motion.div
                  className={precise || result.legendary ? 'score-burst hot legendary' : 'score-burst'}
                  initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 14 }}
                >
                  +{result.points}
                  {result.legendary ? <Zap className="legendary-icon" size={18} /> : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="bar-row">
              <div className="bar-label">
                <span>{t('reveal.yourEstimate')}</span>
                <strong>{formatMeters(result.guessMeters)}</strong>
              </div>
              <div className="bar-track">
                <motion.div
                  className="bar-fill guess"
                  initial={{ width: '0%' }}
                  animate={{ width: stage === 'bars' ? '0%' : barPercent(result.guessMeters, max) }}
                  transition={{ delay: 0.08, duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
            <div className="bar-row">
              <div className="bar-label">
                <span>
                  {t('reveal.actual')} {object.axis}
                </span>
                <strong>{formatMeters(result.correctMeters)}</strong>
              </div>
              <div className="bar-track">
                <motion.div
                  className="bar-fill actual"
                  initial={{ width: '0%' }}
                  animate={{ width: stage === 'bars' ? '0%' : barPercent(result.correctMeters, max) }}
                  transition={{ delay: 0.34, duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {(stage === 'facts' || stage === 'ready') && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 grid gap-3 md:grid-cols-3"
              >
                <div className="reveal-stat">
                  <Gauge size={18} />
                  <span>
                    {formatPercent(result.percentError)} {t('reveal.error')}
                  </span>
                </div>
                <div className="reveal-stat highlight">
                  <Sparkles size={18} />
                  <span>{result.comparisonLine}</span>
                </div>
                <div className="reveal-stat">
                  <span>{result.crowdLine}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(stage === 'facts' || stage === 'ready') && (
            <motion.div
              className="mt-4 border-l border-amberSignal/70 pl-4 text-sm leading-6 text-white/[0.66]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {object.shockFact}
              <p className="mt-2 text-cyanSignal/75">{object.revealLine}</p>
            </motion.div>
          )}

          {stage === 'ready' && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm uppercase tracking-[0.18em] text-cyanSignal/70">
                {formatMeters(result.correctMeters)} {axisCopy(object.axis)}
              </p>
              <button className="secondary-action justify-center px-6" type="button" onClick={onNext}>
                {isFinalRound ? t('game.complete') : t('game.next')}
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </motion.section>
  );
}
