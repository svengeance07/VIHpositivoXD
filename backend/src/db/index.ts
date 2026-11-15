import { sql } from 'drizzle-orm';
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import { env } from '../config/env.js';
import * as schema from './schema.js';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  waitForConnections: true,
  queueLimit: 0,
  charset: 'utf8mb4',
  dateStrings: true,
});

export const db: MySql2Database<typeof schema> = drizzle(pool, {
  schema,
  mode: 'default',
});

export type Database = typeof db;

let closePromise: Promise<void> | null = null;

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (!closePromise) {
    closePromise = pool.end();
  }
  await closePromise;
}

export * from './schema.js';
