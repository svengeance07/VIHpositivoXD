import 'dotenv/config';
import { z } from 'zod';
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.string().trim().min(1).default('0.0.0.0'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
    DB_HOST: z.string().trim().min(1).default('127.0.0.1'),
    DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
    DB_USER: z.string().trim().min(1).default('root'),
    DB_PASSWORD: z.string().default(''),
    DB_NAME: z.string().trim().min(1).default('vacunas'),
    DB_CONNECTION_LIMIT: z.coerce.number().int().min(1).max(100).default(10),
    JWT_SECRET: z
        .string()
        .min(32, 'JWT_SECRET debe tener al menos 32 caracteres para garantizar seguridad.')
        .default('dev_jwt_secret_change_in_production_min_32_chars'),
    JWT_EXPIRES_IN: z.string().trim().min(1).default('8h'),
    COOKIE_SECRET: z
        .string()
        .min(32, 'COOKIE_SECRET debe tener al menos 32 caracteres para firma de cookies.')
        .default('dev_cookie_secret_change_in_production_32_chars'),
    COOKIE_NAME: z.string().trim().min(1).default('sv_access_token'),
    COOKIE_SECURE: z
        .enum(['true', 'false'])
        .default('false')
        .transform((valor) => valor === 'true'),
    CORS_ORIGIN: z
        .string()
        .trim()
        .default('http://localhost:4200')
        .transform((valor) => valor
        .split(',')
        .map((origen) => origen.trim())
        .filter((origen) => origen.length > 0)),
    RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(100),
    RATE_LIMIT_WINDOW: z.string().trim().min(1).default('1 minute'),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(5),
    AUTH_RATE_LIMIT_WINDOW: z.string().trim().min(1).default('1 minute'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Error en la validación de variables de entorno (.env):');
    for (const issue of parsed.error.issues) {
        const campo = issue.path.join('.') || 'ENV';
        console.error(`  - [${campo}]: ${issue.message}`);
    }
    process.exit(1);
}
export const env = {
    ...parsed.data,
    isProduction: parsed.data.NODE_ENV === 'production',
    isDevelopment: parsed.data.NODE_ENV === 'development',
    isTest: parsed.data.NODE_ENV === 'test',
};
//# sourceMappingURL=env.js.map