import { randomUUID } from "crypto";
import { pool, ready } from "./db";

export interface Goal {
  id: string;
  user_id: string;
  nutrient_key: string | null;
  title: string;
  completed: boolean;
  created_at: string;
}

export async function createGoal(userId: string, title: string, nutrientKey?: string): Promise<Goal> {
  await ready();
  const id = randomUUID();
  await pool.query(
    `INSERT INTO goals (id, user_id, nutrient_key, title, completed) VALUES ($1, $2, $3, $4, FALSE)`,
    [id, userId, nutrientKey ?? null, title]
  );
  const { rows } = await pool.query<Goal>(`SELECT * FROM goals WHERE id = $1`, [id]);
  return rows[0];
}

export async function listGoals(userId: string): Promise<Goal[]> {
  await ready();
  const { rows } = await pool.query<Goal>(
    `SELECT * FROM goals WHERE user_id = $1 ORDER BY completed ASC, created_at DESC`,
    [userId]
  );
  return rows;
}

export async function setGoalCompleted(userId: string, goalId: string, completed: boolean) {
  await ready();
  await pool.query(`UPDATE goals SET completed = $1 WHERE id = $2 AND user_id = $3`, [
    completed,
    goalId,
    userId,
  ]);
}

export async function deleteGoal(userId: string, goalId: string) {
  await ready();
  await pool.query(`DELETE FROM goals WHERE id = $1 AND user_id = $2`, [goalId, userId]);
}
