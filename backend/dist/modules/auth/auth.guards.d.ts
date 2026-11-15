import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import type { TipoUsuario } from '../../db/schema.js';
import type { AuthUserContext } from './auth.schemas.js';
/**
 * Middleware de autenticación JWT (cookie HttpOnly o Bearer) que hidrata `request.user`
 * con el contexto RBAC actualizado desde `usuarios` y `autoridades`.
 */
export declare function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void>;
/**
 * Guard RBAC parametrizable para restringir rutas según `usuarios.tipo_usuario`.
 */
export declare function requireRole(...roles: (TipoUsuario | readonly TipoUsuario[])[]): preHandlerHookHandler;
export declare function requireAssignedCentro(user: AuthUserContext): number;
export declare function requireAssignedSubregion(user: AuthUserContext): number;
export declare function assertCentroScope(user: AuthUserContext, targetCentroId: number): void;
export declare function assertSubregionScope(user: AuthUserContext, targetSubregionId: number): void;
