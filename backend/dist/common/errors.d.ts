import type { FastifyInstance } from 'fastify';
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
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    constructor(statusCode: number, code: string, message: string, details?: unknown);
}
export declare class BadRequestError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class ConflictError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class UnprocessableEntityError extends AppError {
    constructor(message?: string, details?: unknown);
}
/**
 * Registra el manejador de rutas no encontradas (404) y el manejador centralizado de errores.
 */
export declare function registerErrorHandler(app: FastifyInstance): void;
