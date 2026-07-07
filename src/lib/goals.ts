import { randomUUID } from "crypto";
import { db } from "./db";

export interface Goal {
  id: string;
  user_id: string;
  nutrient_key: string | null;
  title: string;
  completed: number;
  created_at: string;
}

export function createGoal(userId: string, title: string, nutrientKey?: string): Goal {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO goals (id, user_id, nutrient_key, title, completed, created_at) VALUES (?, ?, ?, ?, 0, ?)`
  ).run(id, userId, nutrientKey ?? null, title, createdAt);
  return db.prepare(`SELECT * FROM goals WHERE id = ?`).get(id) as Goal;
}

export function listGoals(userId: string): Goal[] {
  return db
    .prepare(`SELECT * FROM goals WHERE user_id = ? ORDER BY completed ASC, created_at DESC`)
    .all(userId) as Goal[];
}

export function setGoalCompleted(userId: string, goalId: string, completed: boolean) {
  db.prepare(`UPDATE goals SET completed = ? WHERE id = ? AND user_id = ?`).run(
    completed ? 1 : 0,
    goalId,
    userId
  );
}

export function deleteGoal(userId: string, goalId: string) {
  db.prepare(`DELETE FROM goals WHERE id = ? AND user_id = ?`).run(goalId, userId);
}
