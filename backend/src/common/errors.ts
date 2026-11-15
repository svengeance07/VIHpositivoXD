import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { ZodError } from 'zod';

import { env } from '../config/env.js';

export interface ErrorDetail {
  readonly path: string;
  readonly message: string;
  readonly code?: string;
}

export interface ErrorResponsePayload {
  readonly ok: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

/**
 * Error base de dominio/aplicación para respuestas HTTP predecibles y tipadas.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'La solicitud contiene parámetros inválidos.', details?: unknown) {
    super(400, 'BAD_REQUEST', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Autenticación requerida o token inválido.', details?: unknown) {
    super(401, 'UNAUTHORIZED', message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = 'No cuentas con permisos suficientes para esta operación.',
    details?: unknown,
  ) {
    super(403, 'FORBIDDEN', message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'El recurso solicitado no existe.', details?: unknown) {
    super(404, 'NOT_FOUND', message, details);
  }
}

export class ConflictError extends AppError {
  constructor(
    message = 'El recurso ya existe o genera un conflicto de integridad.',
    details?: unknown,
  ) {
    super(409, 'CONFLICT', message, details);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(
    message = 'La entidad no puede ser procesada por reglas de negocio.',
    details?: unknown,
  ) {
    super(422, 'UNPROCESSABLE_ENTITY', message, details);
  }
}

interface MysqlDriverError {
  readonly code?: string;
  readonly errno?: number;
  readonly sqlMessage?: string;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Inspecciona el error y su propiedad `cause` (usada por Drizzle ORM) para extraer códigos nativos de mysql2.
 */
function extractMysqlError(error: unknown): MysqlDriverError | null {
  const candidates: unknown[] = [error];
  if (isObjectRecord(error) && 'cause' in error) {
    candidates.push(error.cause);
  }

  for (const candidate of candidates) {
    if (isObjectRecord(candidate) && typeof candidate['code'] === 'string') {
      const code = candidate['code'];
      if (code.startsWith('ER_')) {
        return {
          code,
          errno: typeof candidate['errno'] === 'number' ? candidate['errno'] : undefined,
          sqlMessage:
            typeof candidate['sqlMessage'] === 'string' ? candidate['sqlMessage'] : undefined,
        };
      }
    }
  }

  return null;
}

function formatZodIssues(error: ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || 'body',
    message: issue.message,
    code: issue.code,
  }));
}

function formatFastifyValidationErrors(error: FastifyError): ErrorDetail[] {
  if (!Array.isArray(error.validation)) {
    return [];
  }

  return error.validation.map((item) => {
    const rawPath = item.instancePath.replace(/^\//, '').replace(/\//g, '.');
    return {
      path: rawPath || String(item.params?.['missingProperty'] ?? 'request'),
      message: item.message ?? 'Valor inválido.',
      code: item.keyword,
    };
  });
}

function sendError(
  reply: FastifyReply,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): FastifyReply {
  const payload: ErrorResponsePayload =
    details !== undefined
      ? { ok: false, error: { code, message, details } }
      : { ok: false, error: { code, message } };

  return reply.status(statusCode).send(payload);
}

/**
 * Registra el manejador de rutas no encontradas (404) y el manejador centralizado de errores.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    return sendError(
      reply,
      404,
      'NOT_FOUND',
      `La ruta ${request.method} ${request.url} no existe en el servidor.`,
    );
  });

  app.setErrorHandler(
    (error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
      if (hasZodFastifySchemaValidationErrors(error)) {
        const details = error.validation.map((issue) => ({
          path: issue.instancePath.replace(/^\//, '').replace(/\//g, '.') || 'request',
          message: issue.message ?? 'Error de validación.',
          code: issue.keyword,
        }));
        return sendError(
          reply,
          400,
          'VALIDATION_ERROR',
          'Los datos enviados no cumplen con el esquema requerido.',
          details,
        );
      }

      if (error instanceof ZodError) {
        return sendError(
          reply,
          400,
          'VALIDATION_ERROR',
          'Los datos enviados no cumplen con el esquema requerido.',
          formatZodIssues(error),
        );
      }

      const fastifyErr = error as FastifyError;
      if (fastifyErr.code === 'FST_ERR_VALIDATION' || Array.isArray(fastifyErr.validation)) {
        return sendError(
          reply,
          400,
          'VALIDATION_ERROR',
          'Los datos enviados no cumplen con el esquema requerido.',
          formatFastifyValidationErrors(fastifyErr),
        );
      }

      if (error instanceof AppError) {
        return sendError(reply, error.statusCode, error.code, error.message, error.details);
      }

      if (fastifyErr.statusCode === 429) {
        return sendError(
          reply,
          429,
          'TOO_MANY_REQUESTS',
          fastifyErr.message ||
            'Has excedido el límite de solicitudes permitidas. Intenta más tarde.',
        );
      }

      if (typeof fastifyErr.code === 'string' && fastifyErr.code.startsWith('FST_JWT_')) {
        return sendError(
          reply,
          401,
          'UNAUTHORIZED',
          'Sesión inválida o expirada. Inicia sesión nuevamente.',
        );
      }

      const mysqlError = extractMysqlError(error);
      if (mysqlError) {
        switch (mysqlError.code) {
          case 'ER_DUP_ENTRY':
            return sendError(
              reply,
              409,
              'CONFLICT',
              'Ya existe un registro con ese identificador único en el sistema.',
            );
          case 'ER_NO_REFERENCED_ROW':
          case 'ER_NO_REFERENCED_ROW_2':
            return sendError(
              reply,
              400,
              'FOREIGN_KEY_VIOLATION',
              'Uno de los identificadores relacionados no existe en la base de datos.',
            );
          case 'ER_ROW_IS_REFERENCED':
          case 'ER_ROW_IS_REFERENCED_2':
            return sendError(
              reply,
              409,
              'RESOURCE_IN_USE',
              'No se puede modificar o eliminar el registro porque está referenciado por otros datos.',
            );
          case 'ER_BAD_NULL_ERROR':
          case 'ER_DATA_TOO_LONG':
          case 'ER_TRUNCATED_WRONG_VALUE':
            return sendError(
              reply,
              400,
              'DATABASE_CONSTRAINT_ERROR',
              'Los datos proporcionados no cumplen con las restricciones de la base de datos.',
            );
          default:
            request.log.error({ err: error, mysqlError }, 'Error SQL no mapeado explícitamente');
            return sendError(
              reply,
              500,
              'DATABASE_ERROR',
              'Ocurrió un error al procesar la operación en la base de datos.',
            );
        }
      }

      if (
        typeof fastifyErr.statusCode === 'number' &&
        fastifyErr.statusCode >= 400 &&
        fastifyErr.statusCode < 500
      ) {
        return sendError(
          reply,
          fastifyErr.statusCode,
          fastifyErr.code ?? 'CLIENT_ERROR',
          fastifyErr.message,
        );
      }

      request.log.error(
        {
          err: error,
          method: request.method,
          url: request.url,
        },
        'Error interno no controlado',
      );

      return sendError(
        reply,
        500,
        'INTERNAL_SERVER_ERROR',
        env.isProduction
          ? 'Error interno del servidor.'
          : error.message || 'Error interno del servidor.',
      );
    },
  );
}
