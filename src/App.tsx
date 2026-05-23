import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { AmbientStage } from './components/AmbientStage';
import { AuthModal } from './components/AuthModal';
import { GameHeader } from './components/GameHeader';
import { ObjectImage } from './components/ObjectImage';
import { RevealPanel } from './components/RevealPanel';
import { RunComplete } from './components/RunComplete';
import { ScaleSlider } from './components/ScaleSlider';
import { firebase, signInWithGoogle, signOutOfGoogle } from './lib/firebase';
import { playRevealSound } from './lib/sound';
import { useScaleGame } from './hooks/useScaleGame';
import {
  createGuestProfile,
  loadLocalProfile,
  profileFromGoogleUser,
  recordGameSession,
  saveLocalProfile,
} from './services/profileService';
import { submitLeaderboardEntry } from './services/leaderboardService';

const AUTH_CHOICE_KEY = 'scale.authChoiceSeen.v1';

export default function App() {
  const game = useScaleGame();
  const [profile, setProfile] = useState(loadLocalProfile);
  const [authOpen, setAuthOpen] = useState(() => localStorage.getItem(AUTH_CHOICE_KEY) !== 'true');
  const [authError, setAuthError] = useState<string>();
  const recordedSessions = useRef(new Set<string>());

  useEffect(() => {
    if (game.phase === 'revealed' && game.latestResult) {
      const intensity = Math.max(0.2, 1 - Math.min(game.latestResult.logError, 1.5) / 1.5);
      playRevealSound(intensity);

      if (window.innerWidth < 1024) {
        window.setTimeout(() => {
          document.querySelector('.reveal-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 220);
      }
    }
  }, [game.latestResult, game.phase]);

  useEffect(() => {
    if (!game.sessionSummary || recordedSessions.current.has(game.sessionSummary.id)) return;

    recordedSessions.current.add(game.sessionSummary.id);
    recordGameSession(profile, game.sessionSummary, game.results)
      .then(async (nextProfile) => {
        setProfile(nextProfile);
        await submitLeaderboardEntry(nextProfile, game.sessionSummary!, 'global');
        await submitLeaderboardEntry(nextProfile, game.sessionSummary!, 'daily');
      })
      .catch((error) => {
        console.error(error);
      });
  }, [game.results, game.sessionSummary, profile]);

  async function handleGoogle() {
    setAuthError(undefined);

    try {
      const user = await signInWithGoogle();
      const nextProfile = await profileFromGoogleUser(user);
      setProfile(nextProfile);
      localStorage.setItem(AUTH_CHOICE_KEY, 'true');
      setAuthOpen(false);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google sign-in failed.');
    }
  }

  function handleGuest() {
    localStorage.setItem(AUTH_CHOICE_KEY, 'true');
    setAuthOpen(false);
  }

  async function handleSignOut() {
    await signOutOfGoogle();
    const guest = createGuestProfile();
    saveLocalProfile(guest);
    setProfile(guest);
  }

  const revealed = game.phase === 'revealed';
  const charging = game.phase === 'charging';
  const complete = game.phase === 'complete' && game.sessionSummary;

  return (
    <div className="min-h-screen overflow-hidden bg-void font-display text-white">
      <AmbientStage />
      <GameHeader
        bestScore={profile.stats.bestScore}
        profile={profile}
        streak={game.streak}
        totalScore={game.totalScore}
        onAuthOpen={() => setAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 pb-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {complete ? (
            <RunComplete key="complete" results={game.results} summary={game.sessionSummary!} onRestart={game.restart} />
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
                    Round {game.roundIndex + 1}/{game.roundCount}
                  </span>
                  <span>{game.currentObject.category}</span>
                  <span>{game.isPreloading ? 'preloading visual telemetry' : 'visual lock ready'}</span>
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
                      <span>Reality resolving</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence>
                  {revealed && game.latestResult ? (
                    <RevealPanel
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

      <AuthModal
        error={authError}
        googleEnabled={firebase.enabled}
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onGoogle={handleGoogle}
        onGuest={handleGuest}
      />
    </div>
  );
}
