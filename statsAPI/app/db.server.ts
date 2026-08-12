import { Pool } from 'pg';
import dotenv from "dotenv";

dotenv.config();
declare global {
  var __pgPool: Pool | undefined;
}
// Avoids creating a new pool on every hot-reload in dev
const pool =
  global.__pgPool ??
  new Pool({
    connectionString: process.env.DB_URL ?? 'localhost',

  });

if (process.env.NODE_ENV !== 'production') {
  global.__pgPool = pool;
}

export { pool };