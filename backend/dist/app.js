import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import fastifyRateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { registerErrorHandler } from './common/errors.js';
import { env } from './config/env.js';
import { closeDatabaseConnection } from './db/index.js';
import { authRoutes } from './modules/auth/index.js';
import { catalogosRoutes } from './modules/catalogos/index.js';
import { autoridadesRoutes, centrosRoutes, subregionesRoutes, } from './modules/centros/index.js';
import { ciudadanosRoutes } from './modules/ciudadanos/index.js';
import { inmunizacionesRoutes } from './modules/inmunizaciones/index.js';
import { certificadosRoutes, reportesRoutes, } from './modules/reportes/index.js';
/**
 * Configuración estricta de rate limit para reutilizar en la ruta `/api/auth/login` (Fase 3).
 */
export const authLoginRateLimitConfig = {
    max: env.AUTH_RATE_LIMIT_MAX,
    timeWindow: env.AUTH_RATE_LIMIT_WINDOW,
    errorResponseBuilder: (_request, context) => ({
        statusCode: 429,
        ok: false,
        error: {
            code: 'TOO_MANY_LOGIN_ATTEMPTS',
            message: `Demasiados intentos de inicio de sesión. Intenta nuevamente en ${Math.ceil(context.ttl / 1000)} segundos.`,
        },
    }),
};
function buildLoggerOptions() {
    if (env.isTest) {
        return false;
    }
    const baseConfig = {
        level: env.LOG_LEVEL,
        redact: {
            paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.contrasena',
                'req.body.password',
            ],
            censor: '[REDACTED]',
        },
    };
    if (env.isDevelopment) {
        return {
            ...baseConfig,
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname',
                },
            },
        };
    }
    return baseConfig;
}
const healthResponseSchema = z.object({
    ok: z.literal(true),
    service: z.string(),
    environment: z.enum(['development', 'test', 'production']),
    timestamp: z.string(),
    uptimeSeconds: z.number().int().nonnegative(),
});
/**
 * Construye y configura la instancia principal de Fastify con validadores Zod,
 * plugins de seguridad, manejo centralizado de errores y endpoint de salud.
 */
export async function buildApp() {
    const app = Fastify({
        logger: buildLoggerOptions(),
        trustProxy: true,
        disableRequestLogging: env.isTest,
    });
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    await app.register(fastifyHelmet, {
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    });
    await app.register(fastifyCors, {
        origin: env.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    await app.register(fastifyCookie, {
        secret: env.COOKIE_SECRET,
        parseOptions: {
            httpOnly: true,
            sameSite: 'strict',
            secure: env.COOKIE_SECURE,
            path: '/',
        },
    });
    await app.register(fastifyRateLimit, {
        global: true,
        max: env.RATE_LIMIT_MAX,
        timeWindow: env.RATE_LIMIT_WINDOW,
        addHeadersOnExceeding: {
            'x-ratelimit-limit': true,
            'x-ratelimit-remaining': true,
            'x-ratelimit-reset': true,
        },
        addHeaders: {
            'x-ratelimit-limit': true,
            'x-ratelimit-remaining': true,
            'x-ratelimit-reset': true,
            'retry-after': true,
        },
    });
    await app.register(fastifyJwt, {
        secret: env.JWT_SECRET,
        cookie: {
            cookieName: env.COOKIE_NAME,
            signed: false,
        },
        sign: {
            expiresIn: env.JWT_EXPIRES_IN,
        },
    });
    registerErrorHandler(app);
    app.addHook('onClose', async () => {
        await closeDatabaseConnection();
    });
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.register(catalogosRoutes, { prefix: '/api/catalogos' });
    await app.register(centrosRoutes, { prefix: '/api/centros' });
    await app.register(subregionesRoutes, { prefix: '/api/subregiones' });
    await app.register(autoridadesRoutes, { prefix: '/api/autoridades' });
    await app.register(ciudadanosRoutes, { prefix: '/api/ciudadanos' });
    await app.register(inmunizacionesRoutes, { prefix: '/api/inmunizaciones' });
    await app.register(reportesRoutes, { prefix: '/api/reportes' });
    await app.register(certificadosRoutes, { prefix: '/api/certificados' });
    const typedApp = app.withTypeProvider();
    typedApp.get('/api/health', {
        schema: {
            response: {
                200: healthResponseSchema,
            },
        },
    }, async () => ({
        ok: true,
        service: 'sistema-v-backend',
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
    }));
    return typedApp;
}
//# sourceMappingURL=app.js.map