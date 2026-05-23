import { ArrowLeft } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n';

export function AboutScreen() {
  const { navigate } = useApp();
  const { t } = useI18n();

  return (
    <div className="screen-shell">
      <button type="button" className="secondary-action" onClick={() => navigate('menu')}>
        <ArrowLeft size={16} /> Menu
      </button>
      <GlassPanel glow="amber">
        <h2>{t('about.title')}</h2>
        <p className="mt-4 leading-7 text-white/70">{t('about.body')}</p>
        <p className="mt-6 text-sm text-white/45">
          Built as a cinematic perception experiment — every reveal is designed to hit like a documentary twist.
        </p>
      </GlassPanel>
    </div>
  );
}
