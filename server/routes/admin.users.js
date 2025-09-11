import { Router } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { z } from 'zod';
import csrf from 'csurf';
import { requirePermission } from '../authz.js';

const router = Router();
const csrfProtection = csrf({
  cookie: { httpOnly:true, sameSite:'strict', secure: process.env.NODE_ENV==='production' }
});

// Schema walidacji
const newUserSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email().optional().nullable(),
    password: z.string().min(8).max(100),
    permissions: z.array(z.string()).optional().default([])
  });
  
  // lista userów (dodaj username)
  router.get('/users', ...requirePermission('users:manage'), async (_req, res) => {
    const { rows } = await query(`
      SELECT u.id, u.username, u.email,
             COALESCE(ARRAY_AGG(up.perm_key) FILTER (WHERE up.perm_key IS NOT NULL), '{}') AS permissions
      FROM users u
      LEFT JOIN user_permissions up ON up.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at ASC
    `, []);
    res.json(rows.map(r => ({
      id: r.id, username: r.username, email: r.email, permissions: r.permissions
    })));
  });
  
  // dodawanie usera z username
  router.post('/users', ...requirePermission('users:manage'), csrfProtection, async (req, res) => {
    const parsed = newUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Nieprawidłowe dane' });
    const { username, email, password, permissions } = parsed.data;
  
    const dupe = await query('SELECT 1 FROM users WHERE username=$1', [username]);
    if (dupe.rowCount) return res.status(409).json({ error: 'Login zajęty' });
  
    const hash = await bcrypt.hash(password, 12);
    const ins = await query(
      'INSERT INTO users(username, email, password_hash) VALUES ($1,$2,$3) RETURNING id',
      [username, email || null, hash]
    );
    const userId = ins.rows[0].id;
  
    if (permissions?.length) {
      await query(`
        INSERT INTO user_permissions(user_id, perm_key)
        SELECT $1, p.key FROM permissions p WHERE p.key = ANY($2::text[])
        ON CONFLICT DO NOTHING
      `, [userId, permissions]);
    }
  
    res.status(201).json({ id: userId });
  });

// Ustaw (nadpisz) uprawnienia usera
router.put('/users/:id/permissions', ...requirePermission('users:manage'), csrfProtection, async (req, res) => {
  const userId = req.params.id;
  const parsed = setPermsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Nieprawidłowe dane' });

  await query('DELETE FROM user_permissions WHERE user_id=$1', [userId]);
  if (parsed.data.permissions.length) {
    await query(`
      INSERT INTO user_permissions(user_id, perm_key)
      SELECT $1, p.key FROM permissions p WHERE p.key = ANY($2::text[])
      ON CONFLICT DO NOTHING
    `, [userId, parsed.data.permissions]);
  }
  res.json({ ok: true });
});

// Usuń usera
router.delete('/users/:id', ...requirePermission('users:manage'), csrfProtection, async (req, res) => {
  await query('DELETE FROM users WHERE id=$1', [req.params.id]); // sessions kasują się kaskadowo dzięki FK
  res.json({ ok: true });
});

// (opcjonalnie) lista wszystkich możliwych uprawnień do zbudowania checkboxów na froncie
router.get('/permissions', ...requirePermission('users:manage'), async (_req, res) => {
  const { rows } = await query('SELECT key, description FROM permissions ORDER BY key', []);
  res.json(rows);
});

export default router;
