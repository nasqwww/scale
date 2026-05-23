import { AnimatePresence, motion } from 'framer-motion';
import { AmbientStage } from '../components/AmbientStage';
import { AppProvider, useApp } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';
import { AudioProvider } from '../context/AudioContext';
import { AboutScreen } from '../screens/AboutScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { AdminScreen } from '../screens/AdminScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { CollectionScreen } from '../screens/CollectionScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { GameplayScreen } from '../screens/GameplayScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { MultiplayerScreen } from '../screens/MultiplayerScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

function ScreenRouter() {
  const { screen, navigate } = useApp();

  if (screen === 'loading') {
    return <LoadingScreen onReady={() => navigate('menu')} />;
  }

  if (screen === 'gameplay') {
    return <GameplayScreen />;
  }

  const content = (() => {
    switch (screen) {
      case 'menu':
        return <MainMenuScreen />;
      case 'leaderboard':
        return <LeaderboardScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'friends':
        return <FriendsScreen />;
      case 'collection':
        return <CollectionScreen />;
      case 'achievements':
        return <AchievementsScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'about':
        return <AboutScreen />;
      case 'auth':
        return <AuthScreen />;
      case 'admin':
        return <AdminScreen />;
      case 'multiplayer':
        return <MultiplayerScreen />;
      default:
        return <MainMenuScreen />;
    }
  })();

  const showAmbient = true;

  return (
    <div className="min-h-screen bg-void font-display text-white">
      {showAmbient ? <AmbientStage /> : null}
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function AppRoot() {
  return (
    <AuthProvider>
      <AudioProvider>
        <AppProvider>
          <ScreenRouter />
        </AppProvider>
      </AudioProvider>
    </AuthProvider>
  );
}
