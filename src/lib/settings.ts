import { db, ensureNutrientSettings } from "./db";
import { NUTRIENTS } from "./nutrients";

export function getUserNutrientSettings(userId: string): Record<string, boolean> {
  ensureNutrientSettings(userId);
  const rows = db
    .prepare(`SELECT nutrient_key, enabled FROM user_nutrient_settings WHERE user_id = ?`)
    .all(userId) as { nutrient_key: string; enabled: number }[];
  const map: Record<string, boolean> = {};
  for (const n of NUTRIENTS) map[n.key] = true;
  for (const row of rows) map[row.nutrient_key] = !!row.enabled;
  return map;
}

export function setNutrientEnabled(userId: string, nutrientKey: string, enabled: boolean) {
  db.prepare(
    `INSERT INTO user_nutrient_settings (user_id, nutrient_key, enabled)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, nutrient_key) DO UPDATE SET enabled = excluded.enabled`
  ).run(userId, nutrientKey, enabled ? 1 : 0);
}
