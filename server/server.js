// server/index.js
require('dotenv').config({ override: true, quiet: true });

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// ====== KONFIG ======
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const DATABASE_URL = process.env.DATABASE_URL; // np. postgresql://rootdb:super_tajne_haslo@127.0.0.1:5432/automationapp
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const ALLOWED = new Set([
  'https://cracovautomationhub.pl',
  'https://www.cracovautomationhub.pl',
]);

// ====== PROXY / PARSERY / CORS ======
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || ALLOWED.has(origin)) return cb(null, true);
      return cb(new Error('CORS blocked'));
    },
    credentials: true,
  })
);

// ====== PG ======
if (!DATABASE_URL) {
  console.error('❌ Brak DATABASE_URL w .env');
  process.exit(1);
}
const pool = new Pool({ connectionString: DATABASE_URL });

// ====== HEALTHCHECK ======
app.get('/api/health', async (_req, res) => {
  try {
    const r = await pool.query('select 1 as ok');
    res.json({ ok: r.rows[0].ok === 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// ====== LOGIN ======
/**
 * Oczekuje: { "email": "...", "password": "..." }
 * Tabela: users (kolumna na hasło: 'password' ALBO 'password_hash')
 */
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Brak danych logowania' });

    const q =
      'SELECT id, email, password, password_hash FROM public.users WHERE email = $1 LIMIT 1';
    const { rows } = await pool.query(q, [email.toLowerCase()]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Nieprawidłowy login lub hasło' });

    const hash = user.password_hash || user.password; // wspieramy obie nazwy kolumn
    if (!hash) return res.status(500).json({ message: 'Brak kolumny z hasłem w users' });

    const ok = await bcrypt.compare(password, String(hash));
    if (!ok) return res.status(401).json({ message: 'Nieprawidłowy login lub hasło' });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    // jeśli używasz cookie na froncie:
    res.cookie?.('auth', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ token }); // albo pusta 200 jeśli tylko cookie
  } catch (err) {
    next(err);
  }
});

// ====== GLOBAL ERROR ======
app.use((err, _req, res, _next) => {
  console.error('ERR', err);
  res.status(err.status || 500).json({ message: 'Internal error' });
});

// ====== START ======
app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});
