import { pool, ready, ensureNutrientSettings } from "./db";
import { NUTRIENTS } from "./nutrients";

export async function getUserNutrientSettings(userId: string): Promise<Record<string, boolean>> {
  await ensureNutrientSettings(userId);
  const { rows } = await pool.query<{ nutrient_key: string; enabled: boolean }>(
    `SELECT nutrient_key, enabled FROM user_nutrient_settings WHERE user_id = $1`,
    [userId]
  );
  const map: Record<string, boolean> = {};
  for (const n of NUTRIENTS) map[n.key] = true;
  for (const row of rows) map[row.nutrient_key] = row.enabled;
  return map;
}

export async function setNutrientEnabled(userId: string, nutrientKey: string, enabled: boolean) {
  await ready();
  await pool.query(
    `INSERT INTO user_nutrient_settings (user_id, nutrient_key, enabled)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, nutrient_key) DO UPDATE SET enabled = excluded.enabled`,
    [userId, nutrientKey, enabled]
  );
}
