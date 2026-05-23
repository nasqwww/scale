import { motion } from 'framer-motion';
import { ArrowRight, Gauge, Sparkles } from 'lucide-react';
import type { RoundResult, ScaleObject } from '../types';
import { axisCopy, formatMeters, formatPercent } from '../lib/format';

interface RevealPanelProps {
  object: ScaleObject;
  result: RoundResult;
  isFinalRound: boolean;
  onNext: () => void;
}

function barPercent(value: number, max: number) {
  return `${Math.max(7, Math.min(100, (value / max) * 100))}%`;
}

export function RevealPanel({ object, result, isFinalRound, onNext }: RevealPanelProps) {
  const max = Math.max(result.guessMeters, result.correctMeters);
  const precise = result.band === 'impossible' || result.band === 'surgical' || result.band === 'near';

  return (
    <motion.section
      className="reveal-panel"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">Reality lock</p>
          <h3 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{result.verdict}</h3>
        </div>
        <motion.div
          className={precise ? 'score-burst hot' : 'score-burst'}
          initial={{ scale: 0.72, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.22, type: 'spring', stiffness: 260, damping: 16 }}
        >
          +{result.points}
        </motion.div>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="bar-row">
          <div className="bar-label">
            <span>Your estimate</span>
            <strong>{formatMeters(result.guessMeters)}</strong>
          </div>
          <div className="bar-track">
            <motion.div
              className="bar-fill guess"
              initial={{ width: '0%' }}
              animate={{ width: barPercent(result.guessMeters, max) }}
              transition={{ delay: 0.16, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
        <div className="bar-row">
          <div className="bar-label">
            <span>Actual {object.axis}</span>
            <strong>{formatMeters(result.correctMeters)}</strong>
          </div>
          <div className="bar-track">
            <motion.div
              className="bar-fill actual"
              initial={{ width: '0%' }}
              animate={{ width: barPercent(result.correctMeters, max) }}
              transition={{ delay: 0.42, duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="reveal-stat">
          <Gauge size={18} />
          <span>{formatPercent(result.percentError)} error</span>
        </div>
        <div className="reveal-stat">
          <Sparkles size={18} />
          <span>{result.comparisonLine}</span>
        </div>
        <div className="reveal-stat">
          <span>{object.revealLine}</span>
        </div>
      </div>

      <div className="mt-4 border-l border-amberSignal/70 pl-4 text-sm leading-6 text-white/[0.66]">
        {object.shockFact}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm uppercase tracking-[0.18em] text-cyanSignal/70">
          {formatMeters(result.correctMeters)} {axisCopy(object.axis)}
        </p>
        <button className="secondary-action justify-center px-6" type="button" onClick={onNext}>
          {isFinalRound ? 'Complete run' : 'Next anomaly'}
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.section>
  );
}
