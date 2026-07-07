import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { NUTRIENTS } from "./nutrients";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, "app.db");

declare global {
  var __db: Database.Database | undefined;
}

function createDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lab_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      report_date TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lab_values (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
      nutrient_key TEXT NOT NULL,
      value REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_nutrient_settings (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nutrient_key TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (user_id, nutrient_key)
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nutrient_key TEXT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_reports_user ON lab_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_values_report ON lab_values(report_id);
    CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
  `);

  return db;
}

export const db = globalThis.__db ?? createDb();
if (process.env.NODE_ENV !== "production") {
  globalThis.__db = db;
}

const validKeys = new Set(NUTRIENTS.map((n) => n.key));

export function ensureNutrientSettings(userId: string) {
  const existing = db
    .prepare(`SELECT nutrient_key FROM user_nutrient_settings WHERE user_id = ?`)
    .all(userId) as { nutrient_key: string }[];
  const existingKeys = new Set(existing.map((e) => e.nutrient_key));
  const insert = db.prepare(
    `INSERT INTO user_nutrient_settings (user_id, nutrient_key, enabled) VALUES (?, ?, 1)`
  );
  const tx = db.transaction(() => {
    for (const key of validKeys) {
      if (!existingKeys.has(key)) {
        insert.run(userId, key);
      }
    }
  });
  tx();
}
