import { type MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';
export declare const pool: mysql.Pool;
export declare const db: MySql2Database<typeof schema>;
export type Database = typeof db;
export declare function checkDatabaseConnection(): Promise<boolean>;
export declare function closeDatabaseConnection(): Promise<void>;
export * from './schema.js';
