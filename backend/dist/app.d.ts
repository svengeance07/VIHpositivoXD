import { type RateLimitOptions } from '@fastify/rate-limit';
import Fastify from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
/**
 * Configuración estricta de rate limit para reutilizar en la ruta `/api/auth/login` (Fase 3).
 */
export declare const authLoginRateLimitConfig: RateLimitOptions;
/**
 * Construye y configura la instancia principal de Fastify con validadores Zod,
 * plugins de seguridad, manejo centralizado de errores y endpoint de salud.
 */
export declare function buildApp(): Promise<Fastify.FastifyInstance<Fastify.RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, Fastify.FastifyBaseLogger, ZodTypeProvider>>;
export type AppInstance = Awaited<ReturnType<typeof buildApp>>;
