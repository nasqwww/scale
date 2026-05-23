import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/analytics', async (_req, res) => {
  const [users, sessions, topScore] = await Promise.all([
    query<{ count: string }>('SELECT COUNT(*)::text AS count FROM users'),
    query<{ count: string }>('SELECT COUNT(*)::text AS count FROM game_sessions WHERE created_at >= NOW() - INTERVAL \'24 hours\''),
    query('SELECT MAX(score) AS top_score FROM game_sessions'),
  ]);

  return res.json({
    totalUsers: Number(users.rows[0]?.count ?? 0),
    sessions24h: Number(sessions.rows[0]?.count ?? 0),
    topScore: topScore.rows[0]?.top_score ?? 0,
  });
});

router.get('/players', async (req, res) => {
  const search = typeof req.query.q === 'string' ? `%${req.query.q}%` : '%';
  const result = await query(
    `SELECT id, username, email, display_name, role, banned, email_verified, created_at, last_seen_at
     FROM users WHERE username ILIKE $1 OR email ILIKE $1 OR display_name ILIKE $1
     ORDER BY created_at DESC LIMIT 100`,
    [search],
  );
  return res.json({ players: result.rows });
});

router.post('/players/:id/ban', async (req, res) => {
  const banned = Boolean(req.body.banned);
  await query('UPDATE users SET banned = $1 WHERE id = $2', [banned, req.params.id]);
  return res.json({ ok: true });
});

router.get('/objects', async (_req, res) => {
  const result = await query('SELECT id, published, updated_at, payload FROM scale_objects ORDER BY id');
  return res.json({ objects: result.rows });
});

router.put('/objects/:id', async (req, res) => {
  const payload = z.record(z.unknown()).parse(req.body);
  await query(
    `INSERT INTO scale_objects (id, payload, published, updated_at)
     VALUES ($1, $2::jsonb, COALESCE($3, TRUE), NOW())
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, published = EXCLUDED.published, updated_at = NOW()`,
    [req.params.id, JSON.stringify(payload), req.body.published ?? true],
  );
  return res.json({ ok: true });
});

router.delete('/objects/:id', async (req, res) => {
  await query('DELETE FROM scale_objects WHERE id = $1', [req.params.id]);
  return res.json({ ok: true });
});

export default router;
