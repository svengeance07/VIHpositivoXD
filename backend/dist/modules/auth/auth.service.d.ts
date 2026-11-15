import type { AuthUserContext, AuthUserProfile } from './auth.schemas.js';
export declare function resolveAuthContextByUserId(userId: number): Promise<AuthUserContext | null>;
export declare function getAuthProfileByUserId(userId: number): Promise<AuthUserProfile>;
export declare function authenticateUser(correo: string, contrasena: string): Promise<{
    context: AuthUserContext;
    profile: AuthUserProfile;
}>;
