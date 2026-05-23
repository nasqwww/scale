import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const result = await query(
    `SELECT u.id, u.username, u.email, u.display_name, u.avatar_url, u.language, u.country_code,
            u.role, u.email_verified, u.created_at,
            s.games_played, s.rounds_played, s.total_score, s.best_score, s.best_streak,
            s.near_perfects, s.perfects, s.average_percent_error, s.favorite_category
     FROM users u
     LEFT JOIN user_stats s ON s.user_id = u.id
     WHERE u.id = $1`,
    [req.user!.id],
  );

  const row = result.rows[0];
  if (!row) return res.status(404).json({ error: 'User not found.' });

  const achievements = await query(
    `SELECT a.id, a.title, a.description, a.icon, ua.unlocked_at
     FROM user_achievements ua
     JOIN achievements a ON a.id = ua.achievement_id
     WHERE ua.user_id = $1`,
    [req.user!.id],
  );

  const sessions = await query(
    `SELECT id, mode, score, rank_label, best_streak, near_perfects, average_percent_error, created_at
     FROM game_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 12`,
    [req.user!.id],
  );

  return res.json({ user: row, achievements: achievements.rows, recentSessions: sessions.rows });
});

router.patch('/me', requireAuth, async (req, res) => {
  const schema = z.object({
    displayName: z.string().min(2).max(64).optional(),
    language: z.enum(['en', 'ru', 'de', 'es', 'ja']).optional(),
    avatarUrl: z.string().url().optional(),
    countryCode: z.string().length(2).optional(),
    favoriteCategory: z.string().max(64).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { displayName, language, avatarUrl, countryCode, favoriteCategory } = parsed.data;

  if (displayName) {
    await query('UPDATE users SET display_name = $1, updated_at = NOW() WHERE id = $2', [displayName, req.user!.id]);
  }
  if (language) {
    await query('UPDATE users SET language = $1, updated_at = NOW() WHERE id = $2', [language, req.user!.id]);
  }
  if (avatarUrl) {
    await query('UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2', [avatarUrl, req.user!.id]);
  }
  if (countryCode) {
    await query('UPDATE users SET country_code = $1, updated_at = NOW() WHERE id = $2', [countryCode, req.user!.id]);
  }
  if (favoriteCategory) {
    await query(
      'UPDATE user_stats SET favorite_category = $1, updated_at = NOW() WHERE user_id = $2',
      [favoriteCategory, req.user!.id],
    );
  }

  return res.json({ ok: true });
});

router.get('/:username', async (req, res) => {
  const result = await query(
    `SELECT u.username, u.display_name, u.avatar_url, u.country_code, u.last_seen_at,
            s.best_score, s.games_played, s.average_percent_error, s.favorite_category
     FROM users u
     LEFT JOIN user_stats s ON s.user_id = u.id
     WHERE u.username = $1 AND u.banned = FALSE`,
    [req.params.username.toLowerCase()],
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Player not found.' });
  return res.json({ profile: result.rows[0] });
});

export default router;
