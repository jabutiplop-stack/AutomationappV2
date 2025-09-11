import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { query } from '../db.js';


const router = Router();
router.get('/data', requireAuth(), async (req, res) => {
const { rows } = await query('SELECT id, email, created_at FROM users WHERE id = $1', [req.user.id]);
res.json({ me: rows[0] || null, notice: 'Witaj w panelu' });
});
export default router;