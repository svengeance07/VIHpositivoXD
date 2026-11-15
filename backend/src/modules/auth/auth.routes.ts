import type { CookieSerializeOptions } from '@fastify/cookie';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { authLoginRateLimitConfig } from '../../app.js';
import { env } from '../../config/env.js';
import { authenticate } from './auth.guards.js';
import { parseExpirationToSeconds } from './auth.password.js';
import {
  authSuccessResponseSchema,
  loginBodySchema,
  logoutResponseSchema,
} from './auth.schemas.js';
import { authenticateUser, getAuthProfileByUserId } from './auth.service.js';

function buildAuthCookieOptions(includeMaxAge: boolean): CookieSerializeOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'strict',
    path: '/',
    ...(includeMaxAge ? { maxAge: parseExpirationToSeconds(env.JWT_EXPIRES_IN) } : {}),
  };
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.post(
    '/login',
    {
      config: {
        rateLimit: authLoginRateLimitConfig,
      },
      schema: {
        body: loginBodySchema,
        response: {
          200: authSuccessResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { correo_usuario, contrasena } = request.body;
      const { context, profile } = await authenticateUser(correo_usuario, contrasena);

      const token = await reply.jwtSign(context);
      reply.setCookie(env.COOKIE_NAME, token, buildAuthCookieOptions(true));

      return {
        ok: true as const,
        data: { user: profile },
      };
    },
  );

  typedApp.post(
    '/logout',
    {
      schema: {
        response: {
          200: logoutResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      reply.clearCookie(env.COOKIE_NAME, buildAuthCookieOptions(false));

      return {
        ok: true as const,
        message: 'Sesión cerrada correctamente.',
      };
    },
  );

  typedApp.get(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        response: {
          200: authSuccessResponseSchema,
        },
      },
    },
    async (request) => {
      const user = await getAuthProfileByUserId(request.user.id_usuarios);

      return {
        ok: true as const,
        data: { user },
      };
    },
  );
};
