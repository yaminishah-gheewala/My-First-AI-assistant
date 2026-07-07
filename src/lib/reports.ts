import { randomUUID } from "crypto";
import { pool, ready } from "./db";

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

export async function createReport(
  userId: string,
  reportDate: string,
  note: string | undefined,
  values: { key: string; value: number }[]
): Promise<LabReport> {
  await ready();
  const id = randomUUID();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO lab_reports (id, user_id, report_date, note) VALUES ($1, $2, $3, $4)`,
      [id, userId, reportDate, note ?? null]
    );
    for (const v of values) {
      await client.query(
        `INSERT INTO lab_values (id, report_id, nutrient_key, value) VALUES ($1, $2, $3, $4)`,
        [randomUUID(), id, v.key, v.value]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
  const { rows } = await pool.query<LabReport>(`SELECT * FROM lab_reports WHERE id = $1`, [id]);
  return rows[0];
}

export async function listReports(userId: string): Promise<LabReport[]> {
  await ready();
  const { rows } = await pool.query<LabReport>(
    `SELECT * FROM lab_reports WHERE user_id = $1 ORDER BY report_date DESC, created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getReport(userId: string, reportId: string): Promise<LabReport | undefined> {
  await ready();
  const { rows } = await pool.query<LabReport>(
    `SELECT * FROM lab_reports WHERE id = $1 AND user_id = $2`,
    [reportId, userId]
  );
  return rows[0];
}

export async function getReportValues(reportId: string): Promise<LabValueRow[]> {
  await ready();
  const { rows } = await pool.query<LabValueRow>(
    `SELECT * FROM lab_values WHERE report_id = $1`,
    [reportId]
  );
  return rows;
}

export async function deleteReport(userId: string, reportId: string) {
  await ready();
  await pool.query(`DELETE FROM lab_reports WHERE id = $1 AND user_id = $2`, [reportId, userId]);
}

export async function listAllValuesForUser(
  userId: string
): Promise<(LabValueRow & { report_date: string })[]> {
  await ready();
  const { rows } = await pool.query<LabValueRow & { report_date: string }>(
    `SELECT lv.*, lr.report_date as report_date
     FROM lab_values lv
     JOIN lab_reports lr ON lr.id = lv.report_id
     WHERE lr.user_id = $1
     ORDER BY lr.report_date ASC`,
    [userId]
  );
  return rows;
}
