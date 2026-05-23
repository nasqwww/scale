import { motion } from 'framer-motion';
import { Chrome, UserRound, X } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  googleEnabled: boolean;
  error?: string;
  onGuest: () => void;
  onGoogle: () => void;
  onClose: () => void;
}

export function AuthModal({ open, googleEnabled, error, onGuest, onGoogle, onClose }: AuthModalProps) {
  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="auth-panel relative w-full max-w-[440px] overflow-hidden rounded-[8px] border border-white/[0.14] bg-[#071012]/90 p-6 shadow-cyan"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        <button className="icon-button absolute right-4 top-4" type="button" onClick={onClose} aria-label="Close auth">
          <X size={18} />
        </button>
        <div className="mb-6">
          <p className="kicker">Persistent profile</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">SCALE</h2>
          <p className="mt-3 text-sm leading-6 text-white/[0.64]">
            Keep history, best score, streaks, and future leaderboard identity. Guest play stays local.
          </p>
        </div>

        <div className="grid gap-3">
          <button className="primary-action justify-center" type="button" onClick={onGuest}>
            <UserRound size={18} />
            Play as Guest
          </button>
          <button
            className="secondary-action justify-center"
            type="button"
            onClick={onGoogle}
            disabled={!googleEnabled}
            title={googleEnabled ? 'Continue with Google' : 'Firebase env vars are not configured'}
          >
            <Chrome size={18} />
            Continue with Google
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-amberSignal">{error}</p> : null}
        {!googleEnabled ? (
          <p className="mt-4 text-xs leading-5 text-white/[0.42]">
            Google sign-in is wired and activates when the Firebase `VITE_FIREBASE_*` variables are present.
          </p>
        ) : null}
      </motion.section>
    </motion.div>
  );
}
