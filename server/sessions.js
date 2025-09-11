import { query } from './db.js';
const TTL = Number(process.env.SESSION_TTL_SECONDS || 28800); // 8h

export async function setSession(sid, payload){
  const expires = new Date(Date.now() + TTL * 1000).toISOString();
  await query(
    `INSERT INTO sessions(sid, user_id, expires_at)
     VALUES ($1,$2,$3)
     ON CONFLICT (sid) DO UPDATE
     SET user_id=EXCLUDED.user_id, expires_at=EXCLUDED.expires_at`,
    [sid, payload.userId, expires]
  );
}

export async function getSession(sid){
  const { rows } = await query(
    'SELECT user_id FROM sessions WHERE sid=$1 AND expires_at>NOW()', [sid]
  );
  return rows.length ? { userId: rows[0].user_id } : null;
}

export async function delSession(sid){
  await query('DELETE FROM sessions WHERE sid=$1', [sid]);
}

// cleanup co godzinę
setInterval(()=>{
  query('DELETE FROM sessions WHERE expires_at<=NOW()', []).catch(()=>{});
}, 60*60*1000);