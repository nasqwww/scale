import { ArrowLeft, Award } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const catalog = [
  { id: 'first_lock', title: 'First Lock', description: 'Complete your first measurement.' },
  { id: 'surgical', title: 'Surgical Mind', description: 'Land a surgical read.' },
  { id: 'mythic', title: 'Mythic Calibration', description: 'Finish a run at Mythic rank.' },
];

export function AchievementsScreen() {
  const { navigate } = useApp();
  const { profile } = useAuth();

  const unlocked = new Set(
    [
      profile.stats.gamesPlayed > 0 ? 'first_lock' : null,
      profile.stats.nearPerfects > 0 ? 'surgical' : null,
      profile.history.some((session) => session.rank === 'Mythic Calibration') ? 'mythic' : null,
    ].filter(Boolean),
  );

  return (
    <div className="screen-shell">
      <button type="button" className="secondary-action" onClick={() => navigate('menu')}>
        <ArrowLeft size={16} /> Menu
      </button>
      <GlassPanel glow="amber">
        <div className="screen-title-row">
          <Award className="text-amberSignal" />
          <h2>Achievements</h2>
        </div>
        <div className="achievement-grid">
          {catalog.map((item) => (
            <article key={item.id} className={`achievement-card ${unlocked.has(item.id) ? 'unlocked' : ''}`}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
