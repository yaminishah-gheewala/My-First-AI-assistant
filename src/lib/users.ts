import { randomUUID } from "crypto";
import { db, ensureNutrientSettings } from "./db";
import { hashPassword, verifyPassword } from "./auth";

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
}

export function findUserByEmail(email: string): User | undefined {
  return db
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get(email.trim().toLowerCase()) as User | undefined;
}

export function findUserById(id: string): User | undefined {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as User | undefined;
}

export async function createUser(email: string, name: string, password: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }
  const id = randomUUID();
  const passwordHash = await hashPassword(password);
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(id, normalizedEmail, name.trim(), passwordHash, createdAt);
  ensureNutrientSettings(id);
  return findUserById(id)!;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = findUserByEmail(email);
  if (!user) return null;
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return null;
  return user;
}

export async function updatePassword(userId: string, newPassword: string) {
  const hash = await hashPassword(newPassword);
  db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(hash, userId);
}

export function deleteUser(userId: string) {
  db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
}
