import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

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

/** SELECT * FROM table WHERE user_id = $1 ORDER BY col ASC/DESC */
export async function selectForUser<T>(
  table: UserTable,
  userId: string,
  orderBy?: { col: string; asc?: boolean }
): Promise<T[]> {
  assertUserTable(table);
  const db = getSql();
  if (!orderBy) {
    return (await db.query(`SELECT * FROM ${table} WHERE user_id = $1`, [userId])) as T[];
  }
  const dir = orderBy.asc === false ? "DESC" : "ASC";
  // column names are controlled by our code, not user input
  const col = orderBy.col.replace(/[^a-z0-9_]/gi, "");
  return (await db.query(
    `SELECT * FROM ${table} WHERE user_id = $1 ORDER BY ${col} ${dir} NULLS LAST`,
    [userId]
  )) as T[];
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
  return rows[0] ?? null;
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
