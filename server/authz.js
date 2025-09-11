import { query } from './db.js';
import { requireAuth } from './middleware/requireAuth.js';

// Pobierz listę uprawnień usera
export async function getUserPermissions(userId) {
  const { rows } = await query(
    'SELECT perm_key FROM user_permissions WHERE user_id = $1',
    [userId]
  );
  return rows.map(r => r.perm_key);
}

// Middleware, który dołącza perms do req.user
export function attachPermissions() {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) return res.status(401).json({ error: 'Brak sesji' });
      req.user.permissions = await getUserPermissions(req.user.id);
      next();
    } catch (e) {
      next(e);
    }
  };
}

// Wymagaj konkretnego uprawnienia
export function requirePermission(perm) {
  return [
    requireAuth(),            // już mamy
    attachPermissions(),      // dołóż perms
    (req, res, next) => {
      if (!req.user.permissions?.includes(perm)) {
        return res.status(403).json({ error: 'Brak uprawnień' });
      }
      next();
    }
  ];
}