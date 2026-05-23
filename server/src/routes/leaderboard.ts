import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

const scopeSchema = z.enum(['global', 'daily', 'seasonal', 'country', 'friends']);

router.get('/:scope', optionalAuth, async (req, res) => {
  const scope = scopeSchema.parse(req.params.scope);
  const limit = Math.min(Number(req.query.limit ?? 50), 100);
  const country = typeof req.query.country === 'string' ? req.query.country : undefined;
  const season = scope === 'seasonal' ? new Date().getFullYear().toString() : undefined;

  let sql = `SELECT display_name, avatar_url, score, rank_label, country_code, created_at
             FROM leaderboard_entries WHERE scope = $1`;
  const params: unknown[] = [scope];

  if (scope === 'daily') {
    sql += ` AND created_at >= CURRENT_DATE`;
  }
  if (scope === 'seasonal' && season) {
    params.push(season);
    sql += ` AND season = $${params.length}`;
  }
  if (scope === 'country' && country) {
    params.push(country);
    sql += ` AND country_code = $${params.length}`;
  }
  if (scope === 'friends' && req.user) {
    params.push(req.user.id);
    sql += ` AND user_id IN (
      SELECT CASE WHEN requester_id = $${params.length} THEN addressee_id ELSE requester_id END
      FROM friendships WHERE status = 'accepted' AND ($${params.length} = requester_id OR $${params.length} = addressee_id)
    )`;
  }

  params.push(limit);
  sql += ` ORDER BY score DESC, created_at ASC LIMIT $${params.length}`;

  const result = await query(sql, params);
  return res.json({ scope, entries: result.rows });
});

router.post('/submit', requireAuth, async (req, res) => {
  const schema = z.object({
    score: z.number().int().min(0),
    rankLabel: z.string(),
    scope: scopeSchema,
    countryCode: z.string().length(2).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { score, rankLabel, scope, countryCode } = parsed.data;
  await query(
    `INSERT INTO leaderboard_entries (user_id, display_name, avatar_url, score, rank_label, scope, country_code, season)
     SELECT $1, display_name, avatar_url, $2, $3, $4, COALESCE($5, country_code), $6 FROM users WHERE id = $1`,
    [req.user!.id, score, rankLabel, scope, countryCode ?? null, new Date().getFullYear().toString()],
  );

  return res.status(201).json({ ok: true });
});

export default router;
