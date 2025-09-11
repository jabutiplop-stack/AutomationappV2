import { Router } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { loginSchema } from '../util/validator.js';
import { setSession, getSession } from '../sessions.js';
import { getUserPermissions } from '../authz.js'; // jeśli dodałeś wcześniej RBAC

const router = Router();

function setSessionCookie(res, sid){
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('sid', sid, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: Number(process.env.SESSION_TTL_SECONDS||28800)*1000
  });
}

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ error: 'Nieprawidłowe dane' });
  const { username, password } = parsed.data;

  try{
    const { rows } = await query(
      'SELECT id, password_hash FROM users WHERE username = $1',
      [username]
    );
    if(rows.length===0) return res.status(401).json({ error: 'Błędny login lub hasło' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if(!ok) return res.status(401).json({ error: 'Błędny login lub hasło' });

    const sid = uuidv4();
    await setSession(sid, { userId: user.id });
    setSessionCookie(res, sid);
    res.json({ ok: true });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/me', async (req, res) => {
  const sid = req.cookies?.sid;
  if(!sid) return res.status(401).json({ error: 'Brak sesji' });
  const s = await getSession(sid);
  if(!s) return res.status(401).json({ error: 'Sesja nieważna' });

  // Jeśli masz RBAC:
  try {
    const perms = await getUserPermissions(s.userId);
    res.json({ userId: s.userId, permissions: perms });
  } catch {
    res.json({ userId: s.userId, permissions: [] });
  }
});

router.post('/logout', async (req, res) => {
  const sid = req.cookies?.sid;
  if(sid) await (await import('../sessions.js')).delSession(sid);
  res.clearCookie('sid', { path: '/' });
  res.json({ ok: true });
});

export default router;