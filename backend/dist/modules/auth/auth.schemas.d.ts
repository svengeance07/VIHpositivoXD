import { z } from 'zod';
import { type TipoUsuario } from '../../db/schema.js';
export interface AuthUserContext {
    readonly id_usuarios: number;
    readonly correo_usuario: string;
    readonly tipo_usuario: TipoUsuario;
    readonly id_autoridades: number | null;
    readonly id_centro: number | null;
    readonly id_subregion: number | null;
    readonly estado_id: number | null;
}
declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: AuthUserContext;
        user: AuthUserContext;
    }
}
export declare const loginBodySchema: z.ZodObject<{
    correo_usuario: z.ZodEffects<z.ZodString, string, string>;
    contrasena: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correo_usuario: string;
    contrasena: string;
}, {
    correo_usuario: string;
    contrasena: string;
}>;
export declare const autoridadResumenSchema: z.ZodObject<{
    id_autoridades: z.ZodNumber;
    primer_nombre: z.ZodString;
    segundo_nombre: z.ZodString;
    primer_apellido: z.ZodString;
    segundo_apellido: z.ZodString;
    c_i: z.ZodNumber;
    n_impre: z.ZodNumber;
    domicilio: z.ZodNullable<z.ZodString>;
    telefono: z.ZodString;
    profesion_id: z.ZodNullable<z.ZodNumber>;
    nombre_profesion: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nombre_profesion: string | null;
    id_autoridades: number;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    c_i: number;
    n_impre: number;
    domicilio: string | null;
    telefono: string;
    profesion_id: number | null;
}, {
    nombre_profesion: string | null;
    id_autoridades: number;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    c_i: number;
    n_impre: number;
    domicilio: string | null;
    telefono: string;
    profesion_id: number | null;
}>;
export declare const centroSaludResumenSchema: z.ZodObject<{
    id_centro: z.ZodNumber;
    nombre_centro: z.ZodString;
    ubicacion_centro: z.ZodString;
    codigo_centro: z.ZodString;
    parroquia_id: z.ZodNullable<z.ZodNumber>;
    municipio_id: z.ZodNullable<z.ZodNumber>;
    estado_id: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    estado_id: number | null;
    municipio_id: number | null;
    id_centro: number;
    nombre_centro: string;
    ubicacion_centro: string;
    codigo_centro: string;
    parroquia_id: number | null;
}, {
    estado_id: number | null;
    municipio_id: number | null;
    id_centro: number;
    nombre_centro: string;
    ubicacion_centro: string;
    codigo_centro: string;
    parroquia_id: number | null;
}>;
export declare const subregionResumenSchema: z.ZodObject<{
    id_subregion: z.ZodNumber;
    ubicacion: z.ZodString;
    parroquia_id: z.ZodNullable<z.ZodNumber>;
    municipio_id: z.ZodNullable<z.ZodNumber>;
    estado_id: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    estado_id: number | null;
    municipio_id: number | null;
    parroquia_id: number | null;
    id_subregion: number;
    ubicacion: string;
}, {
    estado_id: number | null;
    municipio_id: number | null;
    parroquia_id: number | null;
    id_subregion: number;
    ubicacion: string;
}>;
export declare const authUserProfileSchema: z.ZodObject<{
    id_usuarios: z.ZodNumber;
    correo_usuario: z.ZodString;
    tipo_usuario: z.ZodEnum<["master", "centro_salud_jefe", "subregion"]>;
    id_autoridades: z.ZodNullable<z.ZodNumber>;
    id_centro: z.ZodNullable<z.ZodNumber>;
    id_subregion: z.ZodNullable<z.ZodNumber>;
    estado_id: z.ZodNullable<z.ZodNumber>;
    autoridad: z.ZodNullable<z.ZodObject<{
        id_autoridades: z.ZodNumber;
        primer_nombre: z.ZodString;
        segundo_nombre: z.ZodString;
        primer_apellido: z.ZodString;
        segundo_apellido: z.ZodString;
        c_i: z.ZodNumber;
        n_impre: z.ZodNumber;
        domicilio: z.ZodNullable<z.ZodString>;
        telefono: z.ZodString;
        profesion_id: z.ZodNullable<z.ZodNumber>;
        nombre_profesion: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        nombre_profesion: string | null;
        id_autoridades: number;
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
        c_i: number;
        n_impre: number;
        domicilio: string | null;
        telefono: string;
        profesion_id: number | null;
    }, {
        nombre_profesion: string | null;
        id_autoridades: number;
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
        c_i: number;
        n_impre: number;
        domicilio: string | null;
        telefono: string;
        profesion_id: number | null;
    }>>;
    centro_salud: z.ZodNullable<z.ZodObject<{
        id_centro: z.ZodNumber;
        nombre_centro: z.ZodString;
        ubicacion_centro: z.ZodString;
        codigo_centro: z.ZodString;
        parroquia_id: z.ZodNullable<z.ZodNumber>;
        municipio_id: z.ZodNullable<z.ZodNumber>;
        estado_id: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        estado_id: number | null;
        municipio_id: number | null;
        id_centro: number;
        nombre_centro: string;
        ubicacion_centro: string;
        codigo_centro: string;
        parroquia_id: number | null;
    }, {
        estado_id: number | null;
        municipio_id: number | null;
        id_centro: number;
        nombre_centro: string;
        ubicacion_centro: string;
        codigo_centro: string;
        parroquia_id: number | null;
    }>>;
    subregion: z.ZodNullable<z.ZodObject<{
        id_subregion: z.ZodNumber;
        ubicacion: z.ZodString;
        parroquia_id: z.ZodNullable<z.ZodNumber>;
        municipio_id: z.ZodNullable<z.ZodNumber>;
        estado_id: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        estado_id: number | null;
        municipio_id: number | null;
        parroquia_id: number | null;
        id_subregion: number;
        ubicacion: string;
    }, {
        estado_id: number | null;
        municipio_id: number | null;
        parroquia_id: number | null;
        id_subregion: number;
        ubicacion: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    subregion: {
        estado_id: number | null;
        municipio_id: number | null;
        parroquia_id: number | null;
        id_subregion: number;
        ubicacion: string;
    } | null;
    id_usuarios: number;
    correo_usuario: string;
    tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
    estado_id: number | null;
    id_autoridades: number | null;
    centro_salud: {
        estado_id: number | null;
        municipio_id: number | null;
        id_centro: number;
        nombre_centro: string;
        ubicacion_centro: string;
        codigo_centro: string;
        parroquia_id: number | null;
    } | null;
    id_centro: number | null;
    id_subregion: number | null;
    autoridad: {
        nombre_profesion: string | null;
        id_autoridades: number;
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
        c_i: number;
        n_impre: number;
        domicilio: string | null;
        telefono: string;
        profesion_id: number | null;
    } | null;
}, {
    subregion: {
        estado_id: number | null;
        municipio_id: number | null;
        parroquia_id: number | null;
        id_subregion: number;
        ubicacion: string;
    } | null;
    id_usuarios: number;
    correo_usuario: string;
    tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
    estado_id: number | null;
    id_autoridades: number | null;
    centro_salud: {
        estado_id: number | null;
        municipio_id: number | null;
        id_centro: number;
        nombre_centro: string;
        ubicacion_centro: string;
        codigo_centro: string;
        parroquia_id: number | null;
    } | null;
    id_centro: number | null;
    id_subregion: number | null;
    autoridad: {
        nombre_profesion: string | null;
        id_autoridades: number;
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
        c_i: number;
        n_impre: number;
        domicilio: string | null;
        telefono: string;
        profesion_id: number | null;
    } | null;
}>;
export declare const authSuccessResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    data: z.ZodObject<{
        user: z.ZodObject<{
            id_usuarios: z.ZodNumber;
            correo_usuario: z.ZodString;
            tipo_usuario: z.ZodEnum<["master", "centro_salud_jefe", "subregion"]>;
            id_autoridades: z.ZodNullable<z.ZodNumber>;
            id_centro: z.ZodNullable<z.ZodNumber>;
            id_subregion: z.ZodNullable<z.ZodNumber>;
            estado_id: z.ZodNullable<z.ZodNumber>;
            autoridad: z.ZodNullable<z.ZodObject<{
                id_autoridades: z.ZodNumber;
                primer_nombre: z.ZodString;
                segundo_nombre: z.ZodString;
                primer_apellido: z.ZodString;
                segundo_apellido: z.ZodString;
                c_i: z.ZodNumber;
                n_impre: z.ZodNumber;
                domicilio: z.ZodNullable<z.ZodString>;
                telefono: z.ZodString;
                profesion_id: z.ZodNullable<z.ZodNumber>;
                nombre_profesion: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                nombre_profesion: string | null;
                id_autoridades: number;
                primer_nombre: string;
                segundo_nombre: string;
                primer_apellido: string;
                segundo_apellido: string;
                c_i: number;
                n_impre: number;
                domicilio: string | null;
                telefono: string;
                profesion_id: number | null;
            }, {
                nombre_profesion: string | null;
                id_autoridades: number;
                primer_nombre: string;
                segundo_nombre: string;
                primer_apellido: string;
                segundo_apellido: string;
                c_i: number;
                n_impre: number;
                domicilio: string | null;
                telefono: string;
                profesion_id: number | null;
            }>>;
            centro_salud: z.ZodNullable<z.ZodObject<{
                id_centro: z.ZodNumber;
                nombre_centro: z.ZodString;
                ubicacion_centro: z.ZodString;
                codigo_centro: z.ZodString;
                parroquia_id: z.ZodNullable<z.ZodNumber>;
                municipio_id: z.ZodNullable<z.ZodNumber>;
                estado_id: z.ZodNullable<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                estado_id: number | null;
                municipio_id: number | null;
                id_centro: number;
                nombre_centro: string;
                ubicacion_centro: string;
                codigo_centro: string;
                parroquia_id: number | null;
            }, {
                estado_id: number | null;
                municipio_id: number | null;
                id_centro: number;
                nombre_centro: string;
                ubicacion_centro: string;
                codigo_centro: string;
                parroquia_id: number | null;
            }>>;
            subregion: z.ZodNullable<z.ZodObject<{
                id_subregion: z.ZodNumber;
                ubicacion: z.ZodString;
                parroquia_id: z.ZodNullable<z.ZodNumber>;
                municipio_id: z.ZodNullable<z.ZodNumber>;
                estado_id: z.ZodNullable<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                estado_id: number | null;
                municipio_id: number | null;
                parroquia_id: number | null;
                id_subregion: number;
                ubicacion: string;
            }, {
                estado_id: number | null;
                municipio_id: number | null;
                parroquia_id: number | null;
                id_subregion: number;
                ubicacion: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            subregion: {
                estado_id: number | null;
                municipio_id: number | null;
                parroquia_id: number | null;
                id_subregion: number;
                ubicacion: string;
            } | null;
            id_usuarios: number;
            correo_usuario: string;
            tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
            estado_id: number | null;
            id_autoridades: number | null;
            centro_salud: {
                estado_id: number | null;
                municipio_id: number | null;
                id_centro: number;
                nombre_centro: string;
                ubicacion_centro: string;
                codigo_centro: string;
                parroquia_id: number | null;
            } | null;
            id_centro: number | null;
            id_subregion: number | null;
            autoridad: {
                nombre_profesion: string | null;
                id_autoridades: number;
                primer_nombre: string;
                segundo_nombre: string;
                primer_apellido: string;
                segundo_apellido: string;
                c_i: number;
                n_impre: number;
                domicilio: string | null;
                telefono: string;
                profesion_id: number | null;
            } | null;
        }, {
            subregion: {
                estado_id: number | null;
                municipio_id: number | null;
                parroquia_id: number | null;
                id_subregion: number;
                ubicacion: string;
            } | null;
            id_usuarios: number;
            correo_usuario: string;
            tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
            estado_id: number | null;
            id_autoridades: number | null;
            centro_salud: {
                estado_id: number | null;
                municipio_id: number | null;
                id_centro: number;
                nombre_centro: string;
                ubicacion_centro: string;
                codigo_centro: string;
                parroquia_id: number | null;
            } | null;
            id_centro: number | null;
            id_subregion: number | null;
            autoridad: {
                nombre_profesion: string | null;
                id_autoridades: number;
                primer_nombre: string;
                segundo_nombre: string;
                primer_apellido: string;
                segundo_apellido: string;
                c_i: number;
                n_impre: number;
                domicilio: string | null;
                telefono: string;
                profesion_id: number | null;
            } | null;
        }>;
    }, "strip", z.ZodTypeAny, {
        user: {
            subregion: {
                estado_id: number | null;
                municipio_id: number | null;
                parroquia_id: number | null;
                id_subregion: number;
                ubicacion: string;
            } | null;
            id_usuarios: number;
            correo_usuario: string;
            tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
            estado_id: number | null;
            id_autoridades: number | null;
            centro_salud: {
                estado_id: number | null;
                municipio_id: number | null;
                id_centro: number;
                nombre_centro: string;
                ubicacion_centro: string;
                codigo_centro: string;
                parroquia_id: number | null;
            } | null;
            id_centro: number | null;
            id_subregion: number | null;
            autoridad: {
                nombre_profesion: string | null;
                id_autoridades: number;
                primer_nombre: string;
                segundo_nombre: string;
                primer_apellido: string;
                segundo_apellido: string;
                c_i: number;
                n_impre: number;
                domicilio: string | null;
                telefono: string;
                profesion_id: number | null;
            } | null;
        };
    }, {
        user: {
            subregion: {
                estado_id: number | null;
                municipio_id: number | null;
                parroquia_id: number | null;
                id_subregion: number;
                ubicacion: string;
            } | null;
            id_usuarios: number;
            correo_usuario: string;
            tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
            estado_id: number | null;
            id_autoridades: number | null;
            centro_salud: {
                estado_id: number | null;
                municipio_id: number | null;
                id_centro: number;
                nombre_centro: string;
                ubicacion_centro: string;
                codigo_centro: string;
                parroquia_id: number | null;
            } | null;
            id_centro: number | null;
            id_subregion: number | null;
            autoridad: {
                nombre_profesion: string | null;
                id_autoridades: number;
                primer_nombre: string;
                segundo_nombre: string;
                primer_apellido: string;
                segundo_apellido: string;
                c_i: number;
                n_impre: number;
                domicilio: string | null;
                telefono: string;
                profesion_id: number | null;
            } | null;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        user: {
            subregion: {
                estado_id: number | null;
                municipio_id: number | null;
                parroquia_id: number | null;
                id_subregion: number;
                ubicacion: string;
            } | null;
            id_usuarios: number;
            correo_usuario: string;
            tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
            estado_id: number | null;
            id_autoridades: number | null;
            centro_salud: {
                estado_id: number | null;
                municipio_id: number | null;
                id_centro: number;
                nombre_centro: string;
                ubicacion_centro: string;
                codigo_centro: string;
                parroquia_id: number | null;
            } | null;
            id_centro: number | null;
            id_subregion: number | null;
            autoridad: {
                nombre_profesion: string | null;
                id_autoridades: number;
                primer_nombre: string;
                segundo_nombre: string;
                primer_apellido: string;
                segundo_apellido: string;
                c_i: number;
                n_impre: number;
                domicilio: string | null;
                telefono: string;
                profesion_id: number | null;
            } | null;
        };
    };
    ok: true;
}, {
    data: {
        user: {
            subregion: {
                estado_id: number | null;
                municipio_id: number | null;
                parroquia_id: number | null;
                id_subregion: number;
                ubicacion: string;
            } | null;
            id_usuarios: number;
            correo_usuario: string;
            tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
            estado_id: number | null;
            id_autoridades: number | null;
            centro_salud: {
                estado_id: number | null;
                municipio_id: number | null;
                id_centro: number;
                nombre_centro: string;
                ubicacion_centro: string;
                codigo_centro: string;
                parroquia_id: number | null;
            } | null;
            id_centro: number | null;
            id_subregion: number | null;
            autoridad: {
                nombre_profesion: string | null;
                id_autoridades: number;
                primer_nombre: string;
                segundo_nombre: string;
                primer_apellido: string;
                segundo_apellido: string;
                c_i: number;
                n_impre: number;
                domicilio: string | null;
                telefono: string;
                profesion_id: number | null;
            } | null;
        };
    };
    ok: true;
}>;
export declare const logoutResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    ok: true;
}, {
    message: string;
    ok: true;
}>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type AutoridadResumen = z.infer<typeof autoridadResumenSchema>;
export type CentroSaludResumen = z.infer<typeof centroSaludResumenSchema>;
export type SubregionResumen = z.infer<typeof subregionResumenSchema>;
export type AuthUserProfile = z.infer<typeof authUserProfileSchema>;
