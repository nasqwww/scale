import { ArrowLeft, Swords } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useApp } from '../context/AppContext';

export function MultiplayerScreen() {
  const { navigate, startMode } = useApp();

  return (
    <div className="screen-shell">
      <button type="button" className="secondary-action" onClick={() => navigate('menu')}>
        <ArrowLeft size={16} /> Menu
      </button>
      <GlassPanel glow="cyan">
        <div className="screen-title-row">
          <Swords className="text-cyanSignal" />
          <h2>Multiplayer duels</h2>
        </div>
        <p className="leading-7 text-white/65">
          Challenge a friend to the same seeded anomaly run. Both pilots get identical objects — highest calibration wins.
        </p>
        <button type="button" className="primary-action mt-6" onClick={() => startMode('duel')}>
          <Swords size={16} /> Start duel practice
        </button>
        <button type="button" className="secondary-action mt-3" onClick={() => navigate('friends')}>
          Invite from friends list
        </button>
      </GlassPanel>
    </div>
  );
}
