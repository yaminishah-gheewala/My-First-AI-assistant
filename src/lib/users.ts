import { randomUUID } from "crypto";
import { pool, ready, ensureNutrientSettings } from "./db";
import { hashPassword, verifyPassword } from "./auth";

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  await ready();
  const { rows } = await pool.query<User>(`SELECT * FROM users WHERE email = $1`, [
    email.trim().toLowerCase(),
  ]);
  return rows[0];
}

export async function findUserById(id: string): Promise<User | undefined> {
  await ready();
  const { rows } = await pool.query<User>(`SELECT * FROM users WHERE id = $1`, [id]);
  return rows[0];
}

export async function createUser(email: string, name: string, password: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }
  const id = randomUUID();
  const passwordHash = await hashPassword(password);
  await pool.query(
    `INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)`,
    [id, normalizedEmail, name.trim(), passwordHash]
  );
  await ensureNutrientSettings(id);
  return (await findUserById(id))!;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return null;
  return user;
}

export async function updatePassword(userId: string, newPassword: string) {
  const hash = await hashPassword(newPassword);
  await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hash, userId]);
}

export async function deleteUser(userId: string) {
  await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
}
