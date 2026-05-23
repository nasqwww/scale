import { ArrowLeft, Languages, Volume2 } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { LOCALES, useI18n } from '../i18n';
import type { LocaleCode } from '../types';

export function SettingsScreen() {
  const { navigate } = useApp();
  const { t, locale } = useI18n();
  const { syncLanguage } = useAuth();
  const { enabled, setEnabled } = useAudio();

  return (
    <div className="screen-shell">
      <button type="button" className="secondary-action" onClick={() => navigate('menu')}>
        <ArrowLeft size={16} /> Menu
      </button>
      <GlassPanel>
        <div className="screen-title-row">
          <Languages className="text-cyanSignal" />
          <h2>{t('menu.settings')}</h2>
        </div>

        <section className="settings-block">
          <h3>{t('settings.language')}</h3>
          <div className="language-grid">
            {LOCALES.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`language-card ${locale === item.code ? 'active' : ''}`}
                onClick={() => syncLanguage(item.code as LocaleCode)}
              >
                <span>{item.native}</span>
                <small>{item.label}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-block">
          <h3 className="flex items-center gap-2">
            <Volume2 size={16} /> {t('settings.audio')}
          </h3>
          <label className="toggle-row">
            <span>Sound design</span>
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          </label>
        </section>
      </GlassPanel>
    </div>
  );
}
