CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(64) NOT NULL,
  avatar_url TEXT,
  country_code CHAR(2) DEFAULT 'XX',
  language VARCHAR(8) DEFAULT 'en',
  role VARCHAR(16) DEFAULT 'player',
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  games_played INT DEFAULT 0,
  rounds_played INT DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  best_score INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  near_perfects INT DEFAULT 0,
  perfects INT DEFAULT 0,
  average_percent_error REAL DEFAULT 0,
  favorite_category VARCHAR(64),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_id TEXT,
  mode VARCHAR(32) NOT NULL,
  score INT NOT NULL,
  rank_label VARCHAR(64) NOT NULL,
  best_streak INT DEFAULT 0,
  near_perfects INT DEFAULT 0,
  average_percent_error REAL DEFAULT 0,
  daily_seed TEXT,
  country_code CHAR(2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_id TEXT,
  display_name VARCHAR(64) NOT NULL,
  avatar_url TEXT,
  score INT NOT NULL,
  rank_label VARCHAR(64) NOT NULL,
  scope VARCHAR(24) NOT NULL,
  season VARCHAR(16),
  country_code CHAR(2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_scope_score ON leaderboard_entries(scope, score DESC, created_at ASC);

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(16) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(32) DEFAULT 'star'
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(64) REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS scale_objects (
  id VARCHAR(64) PRIMARY KEY,
  payload JSONB NOT NULL,
  published BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_challenges (
  challenge_date DATE PRIMARY KEY,
  object_ids TEXT[] NOT NULL,
  seed TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(16) DEFAULT 'pending',
  host_score INT,
  guest_score INT,
  seed TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

INSERT INTO achievements (id, title, description, icon) VALUES
  ('first_lock', 'First Lock', 'Complete your first measurement.', 'target'),
  ('surgical', 'Surgical Mind', 'Land a surgical read.', 'crosshair'),
  ('mythic', 'Mythic Calibration', 'Finish a run at Mythic rank.', 'crown')
ON CONFLICT (id) DO NOTHING;
