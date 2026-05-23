import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const userId = req.user!.id;
  const friends = await query(
    `SELECT u.id, u.username, u.display_name, u.avatar_url, u.last_seen_at,
            s.best_score,
            CASE WHEN u.last_seen_at > NOW() - INTERVAL '5 minutes' THEN TRUE ELSE FALSE END AS online
     FROM friendships f
     JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
     LEFT JOIN user_stats s ON s.user_id = u.id
     WHERE f.status = 'accepted' AND ($1 = f.requester_id OR $1 = f.addressee_id)`,
    [userId],
  );

  const pending = await query(
    `SELECT f.id, u.username, u.display_name, u.avatar_url, f.created_at
     FROM friendships f
     JOIN users u ON u.id = f.requester_id
     WHERE f.addressee_id = $1 AND f.status = 'pending'`,
    [userId],
  );

  return res.json({ friends: friends.rows, pendingRequests: pending.rows });
});

router.post('/request', async (req, res) => {
  const username = z.string().min(3).parse(req.body.username).toLowerCase();
  const target = await query<{ id: string }>('SELECT id FROM users WHERE username = $1', [username]);
  if (!target.rows[0]) return res.status(404).json({ error: 'User not found.' });
  if (target.rows[0].id === req.user!.id) return res.status(400).json({ error: 'Cannot friend yourself.' });

  await query(
    `INSERT INTO friendships (requester_id, addressee_id, status)
     VALUES ($1, $2, 'pending')
     ON CONFLICT (requester_id, addressee_id) DO NOTHING`,
    [req.user!.id, target.rows[0].id],
  );

  return res.status(201).json({ ok: true });
});

router.post('/accept/:id', async (req, res) => {
  await query(
    `UPDATE friendships SET status = 'accepted'
     WHERE id = $1 AND addressee_id = $2`,
    [req.params.id, req.user!.id],
  );
  return res.json({ ok: true });
});

router.post('/duel', async (req, res) => {
  const friendId = z.string().uuid().parse(req.body.friendId);
  const seed = `${req.user!.id}-${friendId}-${Date.now()}`;
  const result = await query<{ id: string }>(
    `INSERT INTO duels (host_id, guest_id, seed, status) VALUES ($1, $2, $3, 'pending') RETURNING id`,
    [req.user!.id, friendId, seed],
  );
  return res.status(201).json({ duelId: result.rows[0].id, seed });
});

export default router;
