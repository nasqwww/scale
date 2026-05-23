import { motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  Crown,
  Flame,
  Globe2,
  Infinity,
  Play,
  Rocket,
  Settings,
  Swords,
  Trophy,
  UserRound,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect } from 'react';
import { stopMenuAmbient } from '../lib/sound';
import { MenuButton } from '../components/ui/MenuButton';
import { Particles } from '../components/ui/Particles';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import type { GameMode } from '../types';

export function MainMenuScreen() {
  const { t } = useI18n();
  const { navigate, startMode } = useApp();
  const { profile } = useAuth();
  const audio = useAudio();

  useEffect(() => {
    audio.unlock();
    audio.playMenuAmbient();
    return () => stopMenuAmbient();
  }, [audio]);

  const modes: { mode: GameMode; label: string; icon: typeof Play; accent?: 'cyan' | 'amber' }[] = [
    { mode: 'classic', label: t('menu.play'), icon: Play, accent: 'amber' },
    { mode: 'quick', label: t('menu.quickPlay'), icon: Zap, accent: 'cyan' },
    { mode: 'daily', label: t('menu.daily'), icon: Crown },
    { mode: 'endless', label: t('menu.endless'), icon: Infinity },
    { mode: 'hardcore', label: t('menu.hardcore'), icon: Flame },
    { mode: 'cosmic', label: t('menu.cosmic'), icon: Rocket },
    { mode: 'speed', label: t('menu.speed'), icon: Swords },
  ];

  return (
    <div className="menu-screen">
      <Particles />
      <div className="menu-parallax-back" />
      <header className="menu-header">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="kicker">{t('tagline')}</p>
          <h1 className="menu-title">{t('brand')}</h1>
        </motion.div>
        <button type="button" className="profile-chip" onClick={() => navigate('profile')}>
          <UserRound size={16} />
          <span>{profile.displayName}</span>
        </button>
      </header>

      <div className="menu-grid">
        <nav className="menu-primary">
          {modes.map((item, index) => (
            <MenuButton
              key={item.mode}
              label={item.label}
              icon={item.icon}
              accent={item.accent}
              delay={0.04 * index}
              onClick={() => startMode(item.mode)}
            />
          ))}
        </nav>

        <nav className="menu-secondary">
          <MenuButton label={t('menu.multiplayer')} icon={Swords} delay={0.35} onClick={() => navigate('multiplayer')} />
          <MenuButton label={t('menu.friends')} icon={Users} delay={0.38} onClick={() => navigate('friends')} />
          <MenuButton label={t('menu.leaderboard')} icon={Trophy} delay={0.41} onClick={() => navigate('leaderboard')} />
          <MenuButton label={t('menu.profile')} icon={UserRound} delay={0.44} onClick={() => navigate('profile')} />
          <MenuButton label={t('menu.collection')} icon={BookOpen} delay={0.47} onClick={() => navigate('collection')} />
          <MenuButton label={t('menu.achievements')} icon={Award} delay={0.5} onClick={() => navigate('achievements')} />
          <MenuButton label={t('menu.settings')} icon={Settings} delay={0.53} onClick={() => navigate('settings')} />
          <MenuButton label={t('menu.about')} icon={Globe2} delay={0.56} onClick={() => navigate('about')} />
          {profile.role === 'admin' ? (
            <MenuButton label="Admin" icon={Trophy} accent="amber" delay={0.6} onClick={() => navigate('admin')} />
          ) : null}
        </nav>
      </div>
    </div>
  );
}
