import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';

import { ForbiddenError, UnauthorizedError } from '../../common/errors.js';
import type { TipoUsuario } from '../../db/schema.js';
import type { AuthUserContext } from './auth.schemas.js';
import { resolveAuthContextByUserId } from './auth.service.js';

const authenticatedRequests = new WeakSet<FastifyRequest>();

/**
 * Middleware de autenticación JWT (cookie HttpOnly o Bearer) que hidrata `request.user`
 * con el contexto RBAC actualizado desde `usuarios` y `autoridades`.
 */
export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (authenticatedRequests.has(request) && request.user) {
    return;
  }

  let payload: AuthUserContext;
  try {
    payload = await request.jwtVerify<AuthUserContext>();
  } catch {
    throw new UnauthorizedError('Sesión inválida o expirada. Inicia sesión nuevamente.');
  }

  if (
    typeof payload?.id_usuarios !== 'number' ||
    !Number.isInteger(payload.id_usuarios) ||
    payload.id_usuarios <= 0
  ) {
    throw new UnauthorizedError(
      'El token de sesión no contiene un identificador de usuario válido.',
    );
  }

  const freshContext = await resolveAuthContextByUserId(payload.id_usuarios);
  if (!freshContext) {
    throw new UnauthorizedError('La cuenta autenticada ya no existe o no se encuentra disponible.');
  }

  request.user = freshContext;
  authenticatedRequests.add(request);
}

/**
 * Guard RBAC parametrizable para restringir rutas según `usuarios.tipo_usuario`.
 */
export function requireRole(
  ...roles: (TipoUsuario | readonly TipoUsuario[])[]
): preHandlerHookHandler {
  const allowedRoles = new Set<TipoUsuario>(roles.flat());

  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);

    if (!request.user || !allowedRoles.has(request.user.tipo_usuario)) {
      throw new ForbiddenError('No cuentas con permisos suficientes para realizar esta operación.');
    }
  };
}

export function requireAssignedCentro(user: AuthUserContext): number {
  if (user.id_centro === null) {
    throw new ForbiddenError('El usuario autenticado no tiene un centro de salud asignado.');
  }
  return user.id_centro;
}

export function requireAssignedSubregion(user: AuthUserContext): number {
  if (user.id_subregion === null) {
    throw new ForbiddenError('El usuario autenticado no tiene una subregión de salud asignada.');
  }
  return user.id_subregion;
}

export function assertCentroScope(user: AuthUserContext, targetCentroId: number): void {
  if (user.tipo_usuario === 'master') {
    return;
  }

  if (user.tipo_usuario === 'centro_salud_jefe') {
    const assignedCentroId = requireAssignedCentro(user);
    if (assignedCentroId !== targetCentroId) {
      throw new ForbiddenError(
        'No tienes autorización para acceder a registros de otro centro de salud.',
      );
    }
    return;
  }

  throw new ForbiddenError('No cuentas con autorización directa sobre este centro de salud.');
}

export function assertSubregionScope(user: AuthUserContext, targetSubregionId: number): void {
  if (user.tipo_usuario === 'master') {
    return;
  }

  if (user.tipo_usuario === 'subregion') {
    const assignedSubregionId = requireAssignedSubregion(user);
    if (assignedSubregionId !== targetSubregionId) {
      throw new ForbiddenError(
        'No tienes autorización para acceder a registros de otra subregión.',
      );
    }
    return;
  }

  throw new ForbiddenError('No cuentas con autorización directa sobre esta subregión de salud.');
}
