import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const dbHost = process.env.DB_HOST ?? '127.0.0.1';
const parsedPort = Number(process.env.DB_PORT ?? 3306);
const dbPort = Number.isFinite(parsedPort) ? parsedPort : 3306;
const dbUser = process.env.DB_USER ?? 'root';
const dbPassword = process.env.DB_PASSWORD ?? '';
const dbName = process.env.DB_NAME ?? 'vacunas';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    ...(dbPassword.length > 0 ? { password: dbPassword } : {}),
    database: dbName,
  },
  verbose: true,
  strict: true,
});
