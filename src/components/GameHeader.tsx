import { LogOut, RadioTower, Trophy, UserRound } from 'lucide-react';
import type { PlayerProfile } from '../types';

interface GameHeaderProps {
  profile: PlayerProfile;
  totalScore: number;
  streak: number;
  bestScore: number;
  onAuthOpen: () => void;
  onSignOut: () => void;
}

export function GameHeader({ profile, totalScore, streak, bestScore, onAuthOpen, onSignOut }: GameHeaderProps) {
  return (
    <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="logo-mark" aria-hidden="true">
          <RadioTower size={20} />
        </div>
        <div>
          <p className="kicker">Perception instrument</p>
          <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-3xl">SCALE</h1>
        </div>
      </div>

      <div className="header-cluster">
        <div className="stat-pill">
          <Trophy size={16} />
          <span>{totalScore.toLocaleString()}</span>
        </div>
        <div className="stat-pill amber">
          <span>{streak}x</span>
          <span className="hidden sm:inline">streak</span>
        </div>
        <div className="stat-pill">
          <span>best</span>
          <span>{Math.max(bestScore, profile.bestScore).toLocaleString()}</span>
        </div>
        <button className="profile-chip" type="button" onClick={profile.mode === 'google' ? onSignOut : onAuthOpen}>
          {profile.photoURL ? <img src={profile.photoURL} alt="" /> : <UserRound size={16} />}
          <span>{profile.displayName}</span>
          {profile.mode === 'google' ? <LogOut size={14} /> : null}
        </button>
      </div>
    </header>
  );
}
