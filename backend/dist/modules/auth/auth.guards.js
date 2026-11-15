import { ForbiddenError, UnauthorizedError } from '../../common/errors.js';
import { resolveAuthContextByUserId } from './auth.service.js';
const authenticatedRequests = new WeakSet();
/**
 * Middleware de autenticación JWT (cookie HttpOnly o Bearer) que hidrata `request.user`
 * con el contexto RBAC actualizado desde `usuarios` y `autoridades`.
 */
export async function authenticate(request, _reply) {
    if (authenticatedRequests.has(request) && request.user) {
        return;
    }
    let payload;
    try {
        payload = await request.jwtVerify();
    }
    catch {
        throw new UnauthorizedError('Sesión inválida o expirada. Inicia sesión nuevamente.');
    }
    if (typeof payload?.id_usuarios !== 'number' ||
        !Number.isInteger(payload.id_usuarios) ||
        payload.id_usuarios <= 0) {
        throw new UnauthorizedError('El token de sesión no contiene un identificador de usuario válido.');
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
export function requireRole(...roles) {
    const allowedRoles = new Set(roles.flat());
    return async (request, reply) => {
        await authenticate(request, reply);
        if (!request.user || !allowedRoles.has(request.user.tipo_usuario)) {
            throw new ForbiddenError('No cuentas con permisos suficientes para realizar esta operación.');
        }
    };
}
export function requireAssignedCentro(user) {
    if (user.id_centro === null) {
        throw new ForbiddenError('El usuario autenticado no tiene un centro de salud asignado.');
    }
    return user.id_centro;
}
export function requireAssignedSubregion(user) {
    if (user.id_subregion === null) {
        throw new ForbiddenError('El usuario autenticado no tiene una subregión de salud asignada.');
    }
    return user.id_subregion;
}
export function assertCentroScope(user, targetCentroId) {
    if (user.tipo_usuario === 'master') {
        return;
    }
    if (user.tipo_usuario === 'centro_salud_jefe') {
        const assignedCentroId = requireAssignedCentro(user);
        if (assignedCentroId !== targetCentroId) {
            throw new ForbiddenError('No tienes autorización para acceder a registros de otro centro de salud.');
        }
        return;
    }
    throw new ForbiddenError('No cuentas con autorización directa sobre este centro de salud.');
}
export function assertSubregionScope(user, targetSubregionId) {
    if (user.tipo_usuario === 'master') {
        return;
    }
    if (user.tipo_usuario === 'subregion') {
        const assignedSubregionId = requireAssignedSubregion(user);
        if (assignedSubregionId !== targetSubregionId) {
            throw new ForbiddenError('No tienes autorización para acceder a registros de otra subregión.');
        }
        return;
    }
    throw new ForbiddenError('No cuentas con autorización directa sobre esta subregión de salud.');
}
//# sourceMappingURL=auth.guards.js.map