import { motion } from 'framer-motion';
import { ArrowLeft, LogIn, UserPlus, UserRound } from 'lucide-react';
import { useState } from 'react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';

export function AuthScreen() {
  const { t } = useI18n();
  const { navigate } = useApp();
  const { login, register, continueAsGuest, error } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setLocalError(undefined);

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register({ username, email, password, displayName: username });
      }
      navigate('menu');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen-shell">
      <button type="button" className="secondary-action" onClick={() => navigate('menu')}>
        <ArrowLeft size={16} /> Menu
      </button>

      <GlassPanel className="auth-screen-panel" glow="cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="kicker">{t('brand')}</p>
        <h2 className="mt-2 text-3xl font-semibold">{t('auth.title')}</h2>

        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            <LogIn size={16} /> {t('auth.login')}
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            <UserPlus size={16} /> {t('auth.register')}
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            {t('auth.username')}
            <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
          </label>
          {mode === 'register' ? (
            <label>
              {t('auth.email')}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
          ) : null}
          <label>
            {t('auth.password')}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} />
          </label>
          {(localError || error) && <p className="auth-error">{localError || error}</p>}
          <button className="primary-action justify-center" type="submit" disabled={busy}>
            {mode === 'login' ? t('auth.login') : t('auth.register')}
          </button>
        </form>

        <button
          type="button"
          className="secondary-action mt-4 w-full justify-center"
          onClick={() => {
            continueAsGuest();
            navigate('menu');
          }}
        >
          <UserRound size={16} /> {t('auth.guest')}
        </button>
        {mode === 'register' ? <p className="mt-3 text-xs text-white/45">{t('auth.verifyHint')}</p> : null}
      </GlassPanel>
    </div>
  );
}
