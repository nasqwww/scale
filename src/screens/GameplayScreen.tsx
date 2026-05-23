import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { AmbientStage } from '../components/AmbientStage';
import { GameHeader } from '../components/GameHeader';
import { ObjectImage } from '../components/ObjectImage';
import { RevealSequence } from '../components/RevealSequence';
import { RunComplete } from '../components/RunComplete';
import { ScaleSlider } from '../components/ScaleSlider';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { useScaleGame } from '../hooks/useScaleGame';
import { recordGameSession, saveLocalProfile } from '../services/profileService';
import { submitLeaderboardEntry } from '../services/leaderboardService';
import { api } from '../services/api';

export function GameplayScreen() {
  const { mode, navigate } = useApp();
  const { t } = useI18n();
  const { profile, token, logout } = useAuth();
  const game = useScaleGame(mode);
  const [localProfile, setLocalProfile] = useState(profile);
  const recordedSessions = useRef(new Set<string>());

  useEffect(() => setLocalProfile(profile), [profile]);

  useEffect(() => {
    if (game.phase === 'revealed' && game.latestResult && window.innerWidth < 1024) {
      window.setTimeout(() => {
        document.querySelector('.reveal-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 240);
    }
  }, [game.latestResult, game.phase]);

  useEffect(() => {
    if (!game.sessionSummary || recordedSessions.current.has(game.sessionSummary.id)) return;

    recordedSessions.current.add(game.sessionSummary.id);
    recordGameSession(localProfile, game.sessionSummary, game.results)
      .then(async (nextProfile) => {
        setLocalProfile(nextProfile);
        saveLocalProfile(nextProfile);
        await submitLeaderboardEntry(nextProfile, game.sessionSummary!, 'global');
        await submitLeaderboardEntry(nextProfile, game.sessionSummary!, 'daily');
        await api.submitSession(
          {
            mode: game.sessionSummary!.mode ?? mode,
            score: game.sessionSummary!.score,
            rankLabel: game.sessionSummary!.rank,
            bestStreak: game.sessionSummary!.bestStreak,
            nearPerfects: game.sessionSummary!.nearPerfects,
            averagePercentError: game.sessionSummary!.averagePercentError,
            dailySeed: game.sessionSummary!.dailySeed,
            guestId: nextProfile.mode === 'guest' ? nextProfile.uid : undefined,
          },
          token ?? undefined,
        );
      })
      .catch(console.error);
  }, [game.results, game.sessionSummary, localProfile, mode, token]);

  const revealed = game.phase === 'revealed';
  const charging = game.phase === 'charging';
  const complete = game.phase === 'complete' && game.sessionSummary;

  return (
    <div className="min-h-screen overflow-hidden bg-void font-display text-white">
      <AmbientStage />
      <GameHeader
        bestScore={localProfile.stats.bestScore}
        profile={localProfile}
        streak={game.streak}
        totalScore={game.totalScore}
        onAuthOpen={() => navigate('auth')}
        onSignOut={logout}
        onMenu={() => navigate('menu')}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 pb-8 sm:px-6 lg:px-8">
        {mode === 'speed' && game.phase === 'guessing' ? (
          <div className="speed-timer">
            <span>Speed lock</span>
            <strong>{(game.timeLeftMs / 1000).toFixed(1)}s</strong>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {complete ? (
            <RunComplete
              key="complete"
              results={game.results}
              summary={game.sessionSummary!}
              onRestart={game.restart}
              onMenu={() => navigate('menu')}
            />
          ) : (
            <motion.div
              key={game.currentObject.id}
              className="game-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <section className="stage-column">
                <div className="round-strip">
                  <span>
                    {t('game.round')} {game.roundIndex + 1}/{game.roundCount}
                  </span>
                  <span>{game.currentObject.category}</span>
                  <span>{game.isPreloading ? t('game.preloading') : t('game.ready')}</span>
                </div>
                <ObjectImage object={game.currentObject} revealed={revealed} />
              </section>

              <aside className="side-column">
                {!revealed ? (
                  <ScaleSlider
                    charging={charging}
                    disabled={charging}
                    object={game.currentObject}
                    value={game.guessMeters}
                    hideIntro={mode === 'hardcore'}
                    onChange={game.setGuessMeters}
                    onLock={game.lockGuess}
                  />
                ) : null}

                <AnimatePresence>
                  {charging ? (
                    <motion.div
                      className="charging-panel"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                    >
                      <div className="charging-core" />
                      <span>{t('game.charging')}</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence>
                  {revealed && game.latestResult ? (
                    <RevealSequence
                      key={game.latestResult.objectId}
                      isFinalRound={game.roundIndex === game.roundCount - 1}
                      object={game.currentObject}
                      result={game.latestResult}
                      onNext={game.nextRound}
                    />
                  ) : null}
                </AnimatePresence>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
