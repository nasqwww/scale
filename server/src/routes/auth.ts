import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { config } from '../config.js';
import { query } from '../db/pool.js';
import { signToken } from '../middleware/auth.js';
import { authLimiter, registerLimiter } from '../middleware/rateLimit.js';

const router = Router();

const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().max(255),
  password: z.string().min(10).max(128),
  displayName: z.string().min(2).max(64).optional(),
  language: z.enum(['en', 'ru', 'de', 'es', 'ja']).optional(),
});

const loginSchema = z.object({
  username: z.string().min(3).max(255),
  password: z.string().min(1).max(128),
});

router.post('/register', registerLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { username, email, password, displayName, language } = parsed.data;
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  const verificationToken = randomBytes(32).toString('hex');
  const role = config.adminEmails.includes(email.toLowerCase()) ? 'admin' : 'player';

  try {
    const result = await query<{ id: string }>(
      `INSERT INTO users (username, email, password_hash, display_name, language, role, verification_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [username.toLowerCase(), email.toLowerCase(), passwordHash, displayName ?? username, language ?? 'en', role, verificationToken],
    );

    const userId = result.rows[0].id;
    await query('INSERT INTO user_stats (user_id) VALUES ($1)', [userId]);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SCALE] Verify email token for ${email}: ${verificationToken}`);
    }

    const token = signToken({
      id: userId,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      displayName: displayName ?? username,
      role,
      emailVerified: false,
    });

    return res.status(201).json({
      token,
      user: {
        id: userId,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        displayName: displayName ?? username,
        role,
        emailVerified: false,
        language: language ?? 'en',
      },
      verificationSent: true,
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid credentials.' });
  }

  const identifier = parsed.data.username.toLowerCase();
  const result = await query<{
    id: string;
    username: string;
    email: string;
    display_name: string;
    password_hash: string;
    role: string;
    email_verified: boolean;
    language: string;
    avatar_url: string | null;
    banned: boolean;
  }>(
    `SELECT id, username, email, display_name, password_hash, role, email_verified, language, avatar_url, banned
     FROM users WHERE username = $1 OR email = $1`,
    [identifier],
  );

  const user = result.rows[0];
  if (!user || user.banned) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  await query('UPDATE users SET last_seen_at = NOW() WHERE id = $1', [user.id]);

  const token = signToken({
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.display_name,
    role: user.role,
    emailVerified: user.email_verified,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      emailVerified: user.email_verified,
      language: user.language,
      avatarUrl: user.avatar_url,
    },
  });
});

router.post('/verify-email', authLimiter, async (req, res) => {
  const token = z.string().min(16).parse(req.body.token);
  const result = await query(
    `UPDATE users SET email_verified = TRUE, verification_token = NULL
     WHERE verification_token = $1 RETURNING id`,
    [token],
  );
  if (!result.rowCount) {
    return res.status(400).json({ error: 'Invalid verification token.' });
  }
  return res.json({ verified: true });
});

export default router;
