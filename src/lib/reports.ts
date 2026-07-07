import { randomUUID } from "crypto";
import { db } from "./db";

export interface LabReport {
  id: string;
  user_id: string;
  report_date: string;
  note: string | null;
  created_at: string;
}

export interface LabValueRow {
  id: string;
  report_id: string;
  nutrient_key: string;
  value: number;
}

export function createReport(
  userId: string,
  reportDate: string,
  note: string | undefined,
  values: { key: string; value: number }[]
): LabReport {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO lab_reports (id, user_id, report_date, note, created_at) VALUES (?, ?, ?, ?, ?)`
    ).run(id, userId, reportDate, note ?? null, createdAt);
    const insertValue = db.prepare(
      `INSERT INTO lab_values (id, report_id, nutrient_key, value) VALUES (?, ?, ?, ?)`
    );
    for (const v of values) {
      insertValue.run(randomUUID(), id, v.key, v.value);
    }
  });
  tx();
  return db.prepare(`SELECT * FROM lab_reports WHERE id = ?`).get(id) as LabReport;
}

export function listReports(userId: string): LabReport[] {
  return db
    .prepare(`SELECT * FROM lab_reports WHERE user_id = ? ORDER BY report_date DESC, created_at DESC`)
    .all(userId) as LabReport[];
}

export function getReport(userId: string, reportId: string): LabReport | undefined {
  return db
    .prepare(`SELECT * FROM lab_reports WHERE id = ? AND user_id = ?`)
    .get(reportId, userId) as LabReport | undefined;
}

export function getReportValues(reportId: string): LabValueRow[] {
  return db
    .prepare(`SELECT * FROM lab_values WHERE report_id = ?`)
    .all(reportId) as LabValueRow[];
}

export function deleteReport(userId: string, reportId: string) {
  db.prepare(`DELETE FROM lab_reports WHERE id = ? AND user_id = ?`).run(reportId, userId);
}

export function listAllValuesForUser(userId: string): (LabValueRow & { report_date: string })[] {
  return db
    .prepare(
      `SELECT lv.*, lr.report_date as report_date
       FROM lab_values lv
       JOIN lab_reports lr ON lr.id = lv.report_id
       WHERE lr.user_id = ?
       ORDER BY lr.report_date ASC`
    )
    .all(userId) as (LabValueRow & { report_date: string })[];
}
