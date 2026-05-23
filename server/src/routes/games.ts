import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/sessions', optionalAuth, async (req, res) => {
  const schema = z.object({
    mode: z.string(),
    score: z.number().int(),
    rankLabel: z.string(),
    bestStreak: z.number().int(),
    nearPerfects: z.number().int(),
    averagePercentError: z.number(),
    dailySeed: z.string().optional(),
    guestId: z.string().optional(),
    countryCode: z.string().length(2).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;
  const userId = req.user?.id ?? null;

  const session = await query<{ id: string }>(
    `INSERT INTO game_sessions (user_id, guest_id, mode, score, rank_label, best_streak, near_perfects, average_percent_error, daily_seed, country_code)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [
      userId,
      data.guestId ?? null,
      data.mode,
      data.score,
      data.rankLabel,
      data.bestStreak,
      data.nearPerfects,
      data.averagePercentError,
      data.dailySeed ?? null,
      data.countryCode ?? null,
    ],
  );

  if (userId) {
    await query(
      `UPDATE user_stats SET
        games_played = games_played + 1,
        total_score = total_score + $2,
        best_score = GREATEST(best_score, $2),
        best_streak = GREATEST(best_streak, $3),
        near_perfects = near_perfects + $4,
        average_percent_error = CASE
          WHEN rounds_played = 0 THEN $5
          ELSE (average_percent_error * rounds_played + $5) / (rounds_played + 1)
        END,
        updated_at = NOW()
       WHERE user_id = $1`,
      [userId, data.score, data.bestStreak, data.nearPerfects, data.averagePercentError],
    );
  }

  return res.status(201).json({ sessionId: session.rows[0].id });
});

router.get('/daily', async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const result = await query('SELECT object_ids, seed FROM daily_challenges WHERE challenge_date = $1', [today]);
  if (result.rows[0]) {
    return res.json(result.rows[0]);
  }
  return res.json({ seed: today, objectIds: null });
});

router.post('/daily', requireAuth, async (req, res) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
  const schema = z.object({ date: z.string(), objectIds: z.array(z.string()), seed: z.string() });
  const parsed = schema.parse(req.body);
  await query(
    `INSERT INTO daily_challenges (challenge_date, object_ids, seed, created_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (challenge_date) DO UPDATE SET object_ids = EXCLUDED.object_ids, seed = EXCLUDED.seed`,
    [parsed.date, parsed.objectIds, parsed.seed, req.user!.id],
  );
  return res.json({ ok: true });
});

export default router;
