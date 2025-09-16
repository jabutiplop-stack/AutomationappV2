// AutomationappV2/server/server.js
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import csrf from 'csurf';
import { securityMiddleware } from './security.js';
import path from 'path';
import authRouter from './routes/auth.js';
import panelRouter from './routes/panel.js';
import contactRouter from './routes/contact.js';

// 👉 sesje tylko w Postgresie (bez Redisa)
import { setSession, getSession, delSession } from './sessions.js';

dotenv.config();

const app = express();
app.set('trust proxy', 'loopback');
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
securityMiddleware(app);

// udostępnij helpery sesji w req.ctx (jedna definicja!)
app.use((req, _res, next) => {
  req.ctx = { setSession, getSession, delSession };
  next();
});

// CSRF token (opcjonalnie wymagaj 'csrf-token' przy mutacjach)
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  },
});
app.get('/api/csrf', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// trasy API
app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/panel', panelRouter);
app.use('/api/contact', contactRouter);

import adminUsersRouter from './routes/admin.users.js';
app.use('/api/admin', adminUsersRouter);


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// globalny handler błędów
app.use((err, _req, res, _next) => {
  console.error('ERR', err?.stack || err);
  res.status(500).json({ error: 'Błąd serwera' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));