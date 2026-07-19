import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { toDateKey } from "@/lib/utils";

let sql: NeonQueryFunction<false, false> | null = null;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

/** Tables that are scoped by user_id. */
export const USER_TABLES = [
  "projects",
  "tasks",
  "reminders",
  "schedule_blocks",
  "schedule_entries",
  "schedule_holidays",
  "transactions",
  "ideas",
  "goals",
  "contacts",
  "waiting_items",
  "notes",
  "documents",
  "subscriptions",
  "vehicles",
  "vehicle_events",
  "vehicle_expenses",
  "parking_tickets",
  "monthly_reviews",
  "straton_clients",
  "straton_projects",
  "straton_invoices",
  "straton_hosting",
  "straton_client_reminders",
  "straton_activity",
] as const;

export type UserTable = (typeof USER_TABLES)[number];

function assertUserTable(table: string): asserts table is UserTable {
  if (!(USER_TABLES as readonly string[]).includes(table)) {
    throw new Error(`Invalid table: ${table}`);
  }
}

function isDateOnlyKey(key: string) {
  return (
    key === "date" ||
    key.endsWith("_date") ||
    key.endsWith("_expiry") ||
    key === "last_contacted" ||
    key === "next_follow_up"
  );
}

/** Neon returns JS Date for Postgres date columns — normalize to yyyy-MM-dd strings. */
function normalizeRow<T extends Record<string, unknown>>(row: T): T {
  const next = { ...row };
  for (const key of Object.keys(next)) {
    const value = next[key];
    if (!(value instanceof Date)) continue;
    if (isDateOnlyKey(key)) {
      (next as Record<string, unknown>)[key] = toDateKey(value);
    } else if (key.endsWith("_at") || key === "expires_at") {
      (next as Record<string, unknown>)[key] = value.toISOString();
    }
  }
  return next;
}

function normalizeRows<T>(rows: T[]): T[] {
  return rows.map((row) => normalizeRow(row as Record<string, unknown>) as T);
}

/** SELECT * FROM table WHERE user_id = $1 ORDER BY col ASC/DESC */
export async function selectForUser<T>(
  table: UserTable,
  userId: string,
  orderBy?: { col: string; asc?: boolean }
): Promise<T[]> {
  assertUserTable(table);
  const db = getSql();
  if (!orderBy) {
    const rows = (await db.query(`SELECT * FROM ${table} WHERE user_id = $1`, [userId])) as T[];
    return normalizeRows(rows);
  }
  const dir = orderBy.asc === false ? "DESC" : "ASC";
  // column names are controlled by our code, not user input
  const col = orderBy.col.replace(/[^a-z0-9_]/gi, "");
  const rows = (await db.query(
    `SELECT * FROM ${table} WHERE user_id = $1 ORDER BY ${col} ${dir} NULLS LAST`,
    [userId]
  )) as T[];
  return normalizeRows(rows);
}

export async function selectByIdForUser<T>(
  table: UserTable,
  id: string,
  userId: string
): Promise<T | null> {
  assertUserTable(table);
  const db = getSql();
  const rows = (await db.query(
    `SELECT * FROM ${table} WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [id, userId]
  )) as T[];
  const row = rows[0];
  return row ? (normalizeRow(row as Record<string, unknown>) as T) : null;
}

export async function insertRow<T extends Record<string, unknown>>(
  table: UserTable,
  row: T
): Promise<void> {
  assertUserTable(table);
  const keys = Object.keys(row);
  if (keys.length === 0) return;
  const cols = keys.map((k) => k.replace(/[^a-z0-9_]/gi, ""));
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
  const values = cols.map((k) => row[k]);
  const db = getSql();
  await db.query(
    `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`,
    values
  );
}

export async function updateRow(
  table: UserTable,
  id: string,
  userId: string,
  patch: Record<string, unknown>
): Promise<void> {
  assertUserTable(table);
  const keys = Object.keys(patch);
  if (keys.length === 0) return;
  const cols = keys.map((k) => k.replace(/[^a-z0-9_]/gi, ""));
  const sets = cols.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = [...cols.map((k) => patch[k]), id, userId];
  const db = getSql();
  await db.query(
    `UPDATE ${table} SET ${sets} WHERE id = $${cols.length + 1} AND user_id = $${cols.length + 2}`,
    values
  );
}

export async function deleteRow(
  table: UserTable,
  id: string,
  userId: string
): Promise<void> {
  assertUserTable(table);
  const db = getSql();
  await db.query(`DELETE FROM ${table} WHERE id = $1 AND user_id = $2`, [id, userId]);
}
