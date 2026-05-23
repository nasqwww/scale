import { ArrowLeft, Target } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatPercent } from '../lib/format';

export function ProfileScreen() {
  const { navigate } = useApp();
  const { profile } = useAuth();
  const stats = profile.stats;

  return (
    <div className="screen-shell">
      <button type="button" className="secondary-action" onClick={() => navigate('menu')}>
        <ArrowLeft size={16} /> Menu
      </button>
      <GlassPanel glow="cyan">
        <div className="screen-title-row">
          <Target className="text-cyanSignal" />
          <h2>{profile.displayName}</h2>
        </div>
        <p className="text-sm text-white/50">{profile.mode === 'registered' ? `@${profile.username}` : 'Guest pilot'}</p>

        <div className="profile-grid">
          <div className="end-stat">
            <span>Best score</span>
            <strong>{stats.bestScore}</strong>
          </div>
          <div className="end-stat">
            <span>Games</span>
            <strong>{stats.gamesPlayed}</strong>
          </div>
          <div className="end-stat">
            <span>Best streak</span>
            <strong>{stats.bestStreak}</strong>
          </div>
          <div className="end-stat">
            <span>Avg error</span>
            <strong>{formatPercent(stats.averagePercentError)}</strong>
          </div>
          <div className="end-stat">
            <span>Near perfects</span>
            <strong>{stats.nearPerfects}</strong>
          </div>
          <div className="end-stat">
            <span>Impossible locks</span>
            <strong>{stats.perfects}</strong>
          </div>
        </div>

        <h3 className="mt-6 text-sm uppercase tracking-[0.18em] text-white/45">Recent runs</h3>
        <div className="mt-3 space-y-2">
          {profile.history.length === 0 ? (
            <p className="text-white/50">No runs logged yet.</p>
          ) : (
            profile.history.slice(0, 8).map((session) => (
              <div key={session.id} className="result-row">
                <span>{session.rank}</span>
                <strong>{session.score}</strong>
                <span>{new Date(session.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
