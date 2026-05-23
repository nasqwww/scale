import { motion } from 'framer-motion';
import { Home, RotateCcw, Trophy } from 'lucide-react';
import type { GameSessionSummary, RoundResult } from '../types';
import { formatMeters, formatPercent } from '../lib/format';

interface RunCompleteProps {
  summary: GameSessionSummary;
  results: RoundResult[];
  onRestart: () => void;
  onMenu: () => void;
}

export function RunComplete({ summary, results, onRestart, onMenu }: RunCompleteProps) {
  return (
    <motion.section
      className="complete-panel"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="kicker">Run complete</p>
          <h2 className="mt-2 text-5xl font-semibold text-white sm:text-7xl">{summary.score.toLocaleString()}</h2>
          <p className="mt-3 text-xl text-cyanSignal">{summary.rank}</p>
        </div>
        <div className="score-medallion">
          <Trophy size={32} />
          <span>{summary.bestStreak}x</span>
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <div className="end-stat">
          <span>Average error</span>
          <strong>{formatPercent(summary.averagePercentError)}</strong>
        </div>
        <div className="end-stat">
          <span>Near-perfects</span>
          <strong>{summary.nearPerfects}</strong>
        </div>
        <div className="end-stat">
          <span>Mode</span>
          <strong className="text-lg capitalize">{summary.mode ?? 'classic'}</strong>
        </div>
      </div>

      <div className="mt-7 max-h-[280px] overflow-auto pr-2">
        {results.map((result) => (
          <div className="result-row" key={`${result.objectId}-${result.createdAt}`}>
            <span>{result.objectName}</span>
            <span>
              {formatMeters(result.guessMeters)} / {formatMeters(result.correctMeters)}
            </span>
            <strong>+{result.points}</strong>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button className="primary-action flex-1 justify-center px-6" type="button" onClick={onRestart}>
          <RotateCcw size={18} />
          Recalibrate
        </button>
        <button className="secondary-action flex-1 justify-center px-6" type="button" onClick={onMenu}>
          <Home size={18} />
          Main menu
        </button>
      </div>
    </motion.section>
  );
}
