import { ArrowLeft } from 'lucide-react';
import { scaleObjects } from '../data/scaleObjects';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useApp } from '../context/AppContext';
import { formatMeters } from '../lib/format';

export function CollectionScreen() {
  const { navigate } = useApp();

  return (
    <div className="screen-shell">
      <button type="button" className="secondary-action" onClick={() => navigate('menu')}>
        <ArrowLeft size={16} /> Menu
      </button>
      <GlassPanel>
        <h2>Anomaly collection</h2>
        <p className="text-white/55">{scaleObjects.length} calibrated objects in the telemetry vault.</p>
        <div className="collection-grid">
          {scaleObjects.map((object) => (
            <article key={object.id} className="collection-card">
              <span className="kicker">{object.category}</span>
              <strong>{object.name}</strong>
              <p>{formatMeters(object.exactMeters)}</p>
            </article>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
