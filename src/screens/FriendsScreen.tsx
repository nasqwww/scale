import { ArrowLeft, Swords, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { FriendSummary } from '../types';

export function FriendsScreen() {
  const { navigate } = useApp();
  const { token, profile } = useAuth();
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!token) return;
    api.friends(token).then((payload) => setFriends(payload.friends as FriendSummary[])).catch(() => undefined);
  }, [token]);

  async function sendRequest() {
    if (!token) {
      setMessage('Sign in to add friends.');
      return;
    }
    try {
      await api.friendRequest(token, username);
      setMessage('Friend request sent.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed.');
    }
  }

  return (
    <div className="screen-shell">
      <button type="button" className="secondary-action" onClick={() => navigate('menu')}>
        <ArrowLeft size={16} /> Menu
      </button>
      <GlassPanel>
        <div className="screen-title-row">
          <Swords className="text-cyanSignal" />
          <h2>Friends</h2>
        </div>

        <div className="friend-request-row">
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <button type="button" className="primary-action" onClick={sendRequest}>
            <UserPlus size={16} /> Add
          </button>
        </div>
        {message ? <p className="text-sm text-amberSignal">{message}</p> : null}

        {!token ? (
          <p className="mt-4 text-white/55">Guest mode — friend sync unlocks with an account.</p>
        ) : (
          <div className="friends-list">
            {friends.length === 0 ? (
              <p className="text-white/50">No friends yet. Challenge someone who thinks they know scale.</p>
            ) : (
              friends.map((friend) => (
                <article key={friend.id} className="friend-card">
                  <div>
                    <strong>{friend.displayName}</strong>
                    <p>@{friend.username}</p>
                  </div>
                  <div className="friend-meta">
                    <span className={friend.online ? 'online' : ''}>{friend.online ? 'Online' : 'Away'}</span>
                    <span>Best {friend.bestScore}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        <button type="button" className="secondary-action mt-4" onClick={() => navigate('multiplayer')}>
          <Swords size={16} /> Duel invitations
        </button>
        <p className="mt-2 text-xs text-white/40">Logged in as {profile.displayName}</p>
      </GlassPanel>
    </div>
  );
}
