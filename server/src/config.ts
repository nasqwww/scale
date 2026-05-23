import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 8787),
  jwtSecret: process.env.JWT_SECRET ?? 'scale-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://scale:scale@localhost:5432/scale',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://127.0.0.1:5173',
  adminEmails: (process.env.ADMIN_EMAILS ?? 'admin@scale.game').split(',').map((e) => e.trim()),
  bcryptRounds: 12,
  verificationTokenHours: 24,
};
