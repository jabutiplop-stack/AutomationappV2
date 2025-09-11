import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;


export const pool = new Pool({
host: process.env.PGHOST,
port: process.env.PGPORT,
database: process.env.PGDATABASE,
user: process.env.PGUSER,
password: process.env.PGPASSWORD,
max: 10,
idleTimeoutMillis: 30000
});


export async function query(text, params) {
// Parametryzowane zapytania => anty‑SQLi
return pool.query(text, params);
}