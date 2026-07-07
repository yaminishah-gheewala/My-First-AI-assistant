import { Pool } from "pg";
import { NUTRIENTS } from "./nutrients";

const connectionString =
  process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

declare global {
  var __pgPool: Pool | undefined;
  var __schemaReady: Promise<void> | undefined;
}

const useSsl = !!connectionString && !/localhost|127\.0\.0\.1/.test(connectionString);

// Pool construction is lazy (pg doesn't connect until a query runs), so this
// must not throw at import time — Next.js imports this module while
// building, before deploy-time environment variables like a database
// connection string are necessarily available.
export const pool =
  globalThis.__pgPool ??
  new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgPool = pool;
}

async function initSchema() {
  if (!connectionString) {
    throw new Error(
      "No database connection string found. Set POSTGRES_URL (or DATABASE_URL) in your environment, then redeploy."
    );
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS lab_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      report_date TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS lab_values (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
      nutrient_key TEXT NOT NULL,
      value DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_nutrient_settings (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nutrient_key TEXT NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      PRIMARY KEY (user_id, nutrient_key)
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nutrient_key TEXT,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_reports_user ON lab_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_values_report ON lab_values(report_id);
    CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
  `);
}

export function ready(): Promise<void> {
  if (!globalThis.__schemaReady) {
    globalThis.__schemaReady = initSchema();
  }
  return globalThis.__schemaReady;
}

const NUTRIENT_KEYS = NUTRIENTS.map((n) => n.key);

export async function ensureNutrientSettings(userId: string) {
  await ready();
  const values = NUTRIENT_KEYS.map((_, i) => `($1, $${i + 2}, TRUE)`).join(", ");
  await pool.query(
    `INSERT INTO user_nutrient_settings (user_id, nutrient_key, enabled)
     VALUES ${values}
     ON CONFLICT (user_id, nutrient_key) DO NOTHING`,
    [userId, ...NUTRIENT_KEYS]
  );
}
