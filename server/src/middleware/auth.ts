import type { Request, Response, NextFunction } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config.js';
import { query } from '../db/pool.js';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser) {
  const options: SignOptions = { expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ sub: user.id, username: user.username, role: user.role }, config.jwtSecret, options);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as { sub: string };
    const result = await query<{
      id: string;
      username: string;
      email: string;
      display_name: string;
      role: string;
      email_verified: boolean;
      banned: boolean;
    }>('SELECT id, username, email, display_name, role, email_verified, banned FROM users WHERE id = $1', [
      payload.sub,
    ]);

    const row = result.rows[0];
    if (!row || row.banned) {
      return res.status(401).json({ error: 'Invalid session.' });
    }

    req.user = {
      id: row.id,
      username: row.username,
      email: row.email,
      displayName: row.display_name,
      role: row.role,
      emailVerified: row.email_verified,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as { sub: string };
    const result = await query<{
      id: string;
      username: string;
      email: string;
      display_name: string;
      role: string;
      email_verified: boolean;
      banned: boolean;
    }>('SELECT id, username, email, display_name, role, email_verified, banned FROM users WHERE id = $1', [
      payload.sub,
    ]);
    const row = result.rows[0];
    if (row && !row.banned) {
      req.user = {
        id: row.id,
        username: row.username,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        emailVerified: row.email_verified,
      };
    }
  } catch {
    /* guest */
  }
  next();
}
