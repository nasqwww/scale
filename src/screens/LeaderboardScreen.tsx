import { ArrowLeft, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { fetchLeaderboard } from '../services/leaderboardService';
import type { LeaderboardScope } from '../types';

const scopes: LeaderboardScope[] = ['global', 'daily', 'seasonal', 'country', 'friends'];

export function LeaderboardScreen() {
  const { navigate } = useApp();
  const { token } = useAuth();
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [entries, setEntries] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetchLeaderboard(scope, token ?? undefined).then(setEntries);
  }, [scope, token]);

  return (
    <div className="screen-shell">
      <button type="button" className="secondary-action" onClick={() => navigate('menu')}>
        <ArrowLeft size={16} /> Menu
      </button>
      <GlassPanel glow="amber">
        <div className="screen-title-row">
          <Trophy className="text-amberSignal" />
          <h2>Leaderboards</h2>
        </div>
        <div className="scope-tabs">
          {scopes.map((item) => (
            <button key={item} type="button" className={scope === item ? 'active' : ''} onClick={() => setScope(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="leaderboard-list">
          {entries.length === 0 ? (
            <p className="text-white/50">No entries yet — be the first mythic calibration.</p>
          ) : (
            entries.map((entry, index) => (
              <div key={`${entry.display_name ?? entry.displayName}-${index}`} className="leaderboard-row">
                <span>#{index + 1}</span>
                <strong>{String(entry.display_name ?? entry.displayName ?? 'Pilot')}</strong>
                <span>{Number(entry.score ?? 0).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
