import { ArrowLeft, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { scaleObjects } from '../data/scaleObjects';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function AdminScreen() {
  const { navigate } = useApp();
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<Record<string, number>>({});
  const [players, setPlayers] = useState<unknown[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!token) return;
    api.adminAnalytics(token).then(setAnalytics).catch(() => undefined);
    api.adminPlayers(token, query).then((payload) => setPlayers(payload.players)).catch(() => undefined);
  }, [token, query]);

  if (!token) {
    return (
      <div className="screen-shell">
        <p>Admin access requires a signed-in admin account.</p>
        <button type="button" className="secondary-action" onClick={() => navigate('auth')}>
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="screen-shell admin-shell">
      <button type="button" className="secondary-action" onClick={() => navigate('menu')}>
        <ArrowLeft size={16} /> Menu
      </button>

      <GlassPanel glow="cyan">
        <div className="screen-title-row">
          <Shield className="text-cyanSignal" />
          <h2>Admin control</h2>
        </div>
        <div className="admin-metrics">
          <div className="end-stat">
            <span>Users</span>
            <strong>{analytics.totalUsers ?? 0}</strong>
          </div>
          <div className="end-stat">
            <span>Sessions 24h</span>
            <strong>{analytics.sessions24h ?? 0}</strong>
          </div>
          <div className="end-stat">
            <span>Top score</span>
            <strong>{analytics.topScore ?? 0}</strong>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="mt-4">
        <h3>Players</h3>
        <input className="admin-search" placeholder="Search players" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="admin-table">
          {(players as Array<Record<string, unknown>>).map((player) => (
            <div key={String(player.id)} className="admin-row">
              <strong>{String(player.username)}</strong>
              <span>{String(player.email)}</span>
              <span>{player.banned ? 'banned' : 'active'}</span>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="mt-4">
        <h3>Objects ({scaleObjects.length})</h3>
        <p className="text-sm text-white/50">Curated anomalies — edit via API or future upload UI.</p>
        <div className="collection-grid compact">
          {scaleObjects.map((object) => (
            <article key={object.id} className="collection-card">
              <strong>{object.name}</strong>
              <p>{object.category}</p>
            </article>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
