import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { globalLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import friendsRoutes from './routes/friends.js';
import leaderboardRoutes from './routes/leaderboard.js';
import gamesRoutes from './routes/games.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(globalLimiter);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'scale-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/admin', adminRoutes);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(config.port, () => {
  console.log(`SCALE API listening on http://127.0.0.1:${config.port}`);
});
