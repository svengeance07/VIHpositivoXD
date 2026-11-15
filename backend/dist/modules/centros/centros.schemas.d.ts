import { z } from 'zod';
import { idParamSchema, okSchema } from '../catalogos/catalogos.schemas.js';
export { idParamSchema, okSchema };
export declare const jefeResumenSchema: z.ZodObject<{
    id_autoridades: z.ZodNumber;
    primer_nombre: z.ZodString;
    segundo_nombre: z.ZodString;
    primer_apellido: z.ZodString;
    segundo_apellido: z.ZodString;
    c_i: z.ZodNumber;
    n_impre: z.ZodNumber;
    telefono: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id_autoridades: number;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    c_i: number;
    n_impre: number;
    telefono: string;
}, {
    id_autoridades: number;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    c_i: number;
    n_impre: number;
    telefono: string;
}>;
export declare const autoridadDetalleSchema: z.ZodObject<{
    id_autoridades: z.ZodNumber;
    primer_nombre: z.ZodString;
    segundo_nombre: z.ZodString;
    primer_apellido: z.ZodString;
    segundo_apellido: z.ZodString;
    c_i: z.ZodNumber;
    n_impre: z.ZodNumber;
    domicilio: z.ZodNullable<z.ZodString>;
    telefono: z.ZodString;
    usuario_id: z.ZodNullable<z.ZodNumber>;
    profesion_id: z.ZodNullable<z.ZodNumber>;
    nombre_profesion: z.ZodNullable<z.ZodString>;
    correo_usuario: z.ZodNullable<z.ZodString>;
    tipo_usuario: z.ZodNullable<z.ZodEnum<["master", "centro_salud_jefe", "subregion"]>>;
    id_centro_asignado: z.ZodNullable<z.ZodNumber>;
    id_subregion_asignada: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    correo_usuario: string | null;
    tipo_usuario: "master" | "centro_salud_jefe" | "subregion" | null;
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
    usuario_id: number | null;
    profesion_id: number | null;
    id_centro_asignado: number | null;
    id_subregion_asignada: number | null;
}, {
    correo_usuario: string | null;
    tipo_usuario: "master" | "centro_salud_jefe" | "subregion" | null;
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
    usuario_id: number | null;
    profesion_id: number | null;
    id_centro_asignado: number | null;
    id_subregion_asignada: number | null;
}>;
export declare const autoridadesQuerySchema: z.ZodObject<{
    c_i: z.ZodOptional<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    c_i?: number | undefined;
}, {
    search?: string | undefined;
    c_i?: number | undefined;
}>;
export declare const createAutoridadBodySchema: z.ZodEffects<z.ZodObject<{
    primer_nombre: z.ZodString;
    segundo_nombre: z.ZodString;
    primer_apellido: z.ZodString;
    segundo_apellido: z.ZodString;
    c_i: z.ZodNumber;
    n_impre: z.ZodNumber;
    domicilio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    telefono: z.ZodString;
    profesion_id: z.ZodNumber;
    usuario_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cuenta_usuario: z.ZodOptional<z.ZodObject<{
        correo_usuario: z.ZodEffects<z.ZodString, string, string>;
        contrasena: z.ZodString;
        tipo_usuario: z.ZodEnum<["master", "centro_salud_jefe", "subregion"]>;
    }, "strip", z.ZodTypeAny, {
        correo_usuario: string;
        contrasena: string;
        tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
    }, {
        correo_usuario: string;
        contrasena: string;
        tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
    }>>;
}, "strip", z.ZodTypeAny, {
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    c_i: number;
    n_impre: number;
    telefono: string;
    profesion_id: number;
    domicilio?: string | null | undefined;
    usuario_id?: number | null | undefined;
    cuenta_usuario?: {
        correo_usuario: string;
        contrasena: string;
        tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
    } | undefined;
}, {
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    c_i: number;
    n_impre: number;
    telefono: string;
    profesion_id: number;
    domicilio?: string | null | undefined;
    usuario_id?: number | null | undefined;
    cuenta_usuario?: {
        correo_usuario: string;
        contrasena: string;
        tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
    } | undefined;
}>, {
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    c_i: number;
    n_impre: number;
    telefono: string;
    profesion_id: number;
    domicilio?: string | null | undefined;
    usuario_id?: number | null | undefined;
    cuenta_usuario?: {
        correo_usuario: string;
        contrasena: string;
        tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
    } | undefined;
}, {
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    c_i: number;
    n_impre: number;
    telefono: string;
    profesion_id: number;
    domicilio?: string | null | undefined;
    usuario_id?: number | null | undefined;
    cuenta_usuario?: {
        correo_usuario: string;
        contrasena: string;
        tipo_usuario: "master" | "centro_salud_jefe" | "subregion";
    } | undefined;
}>;
export declare const updateAutoridadBodySchema: z.ZodEffects<z.ZodObject<{
    primer_nombre: z.ZodOptional<z.ZodString>;
    segundo_nombre: z.ZodOptional<z.ZodString>;
    primer_apellido: z.ZodOptional<z.ZodString>;
    segundo_apellido: z.ZodOptional<z.ZodString>;
    c_i: z.ZodOptional<z.ZodNumber>;
    n_impre: z.ZodOptional<z.ZodNumber>;
    domicilio: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    telefono: z.ZodOptional<z.ZodString>;
    profesion_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    primer_nombre?: string | undefined;
    segundo_nombre?: string | undefined;
    primer_apellido?: string | undefined;
    segundo_apellido?: string | undefined;
    c_i?: number | undefined;
    n_impre?: number | undefined;
    domicilio?: string | null | undefined;
    telefono?: string | undefined;
    profesion_id?: number | undefined;
}, {
    primer_nombre?: string | undefined;
    segundo_nombre?: string | undefined;
    primer_apellido?: string | undefined;
    segundo_apellido?: string | undefined;
    c_i?: number | undefined;
    n_impre?: number | undefined;
    domicilio?: string | null | undefined;
    telefono?: string | undefined;
    profesion_id?: number | undefined;
}>, {
    primer_nombre?: string | undefined;
    segundo_nombre?: string | undefined;
    primer_apellido?: string | undefined;
    segundo_apellido?: string | undefined;
    c_i?: number | undefined;
    n_impre?: number | undefined;
    domicilio?: string | null | undefined;
    telefono?: string | undefined;
    profesion_id?: number | undefined;
}, {
    primer_nombre?: string | undefined;
    segundo_nombre?: string | undefined;
    primer_apellido?: string | undefined;
    segundo_apellido?: string | undefined;
    c_i?: number | undefined;
    n_impre?: number | undefined;
    domicilio?: string | null | undefined;
    telefono?: string | undefined;
    profesion_id?: number | undefined;
}>;
export declare const centroSaludDetalleSchema: z.ZodObject<{
    id_centro: z.ZodNumber;
    nombre_centro: z.ZodString;
    ubicacion_centro: z.ZodString;
    codigo_centro: z.ZodString;
    id_jefe_centro: z.ZodNullable<z.ZodNumber>;
    parroquia_id: z.ZodNullable<z.ZodNumber>;
    municipio_id: z.ZodNullable<z.ZodNumber>;
    estado_id: z.ZodNullable<z.ZodNumber>;
    nombre_estado: z.ZodNullable<z.ZodString>;
    nombre_municipio: z.ZodNullable<z.ZodString>;
    nombre_parroquia: z.ZodNullable<z.ZodString>;
    jefe_centro: z.ZodNullable<z.ZodObject<{
        id_autoridades: z.ZodNumber;
        primer_nombre: z.ZodString;
        segundo_nombre: z.ZodString;
        primer_apellido: z.ZodString;
        segundo_apellido: z.ZodString;
        c_i: z.ZodNumber;
        n_impre: z.ZodNumber;
        telefono: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id_autoridades: number;
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
        c_i: number;
        n_impre: number;
        telefono: string;
    }, {
        id_autoridades: number;
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
        c_i: number;
        n_impre: number;
        telefono: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    nombre_estado: string | null;
    nombre_municipio: string | null;
    estado_id: number | null;
    nombre_parroquia: string | null;
    municipio_id: number | null;
    id_centro: number;
    nombre_centro: string;
    ubicacion_centro: string;
    codigo_centro: string;
    id_jefe_centro: number | null;
    parroquia_id: number | null;
    jefe_centro: {
        id_autoridades: number;
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
        c_i: number;
        n_impre: number;
        telefono: string;
    } | null;
}, {
    nombre_estado: string | null;
    nombre_municipio: string | null;
    estado_id: number | null;
    nombre_parroquia: string | null;
    municipio_id: number | null;
    id_centro: number;
    nombre_centro: string;
    ubicacion_centro: string;
    codigo_centro: string;
    id_jefe_centro: number | null;
    parroquia_id: number | null;
    jefe_centro: {
        id_autoridades: number;
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
        c_i: number;
        n_impre: number;
        telefono: string;
    } | null;
}>;
export declare const centrosSaludQuerySchema: z.ZodObject<{
    estado_id: z.ZodOptional<z.ZodNumber>;
    municipio_id: z.ZodOptional<z.ZodNumber>;
    parroquia_id: z.ZodOptional<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    estado_id?: number | undefined;
    municipio_id?: number | undefined;
    parroquia_id?: number | undefined;
}, {
    search?: string | undefined;
    estado_id?: number | undefined;
    municipio_id?: number | undefined;
    parroquia_id?: number | undefined;
}>;
export declare const createCentroSaludBodySchema: z.ZodObject<{
    nombre_centro: z.ZodString;
    ubicacion_centro: z.ZodString;
    codigo_centro: z.ZodEffects<z.ZodString, string, string>;
    id_jefe_centro: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    estado_id: z.ZodNumber;
    municipio_id: z.ZodNumber;
    parroquia_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    estado_id: number;
    municipio_id: number;
    nombre_centro: string;
    ubicacion_centro: string;
    codigo_centro: string;
    parroquia_id: number;
    id_jefe_centro?: number | null | undefined;
}, {
    estado_id: number;
    municipio_id: number;
    nombre_centro: string;
    ubicacion_centro: string;
    codigo_centro: string;
    parroquia_id: number;
    id_jefe_centro?: number | null | undefined;
}>;
export declare const updateCentroSaludBodySchema: z.ZodEffects<z.ZodObject<{
    nombre_centro: z.ZodOptional<z.ZodString>;
    ubicacion_centro: z.ZodOptional<z.ZodString>;
    codigo_centro: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    id_jefe_centro: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    estado_id: z.ZodOptional<z.ZodNumber>;
    municipio_id: z.ZodOptional<z.ZodNumber>;
    parroquia_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    estado_id?: number | undefined;
    municipio_id?: number | undefined;
    nombre_centro?: string | undefined;
    ubicacion_centro?: string | undefined;
    codigo_centro?: string | undefined;
    id_jefe_centro?: number | null | undefined;
    parroquia_id?: number | undefined;
}, {
    estado_id?: number | undefined;
    municipio_id?: number | undefined;
    nombre_centro?: string | undefined;
    ubicacion_centro?: string | undefined;
    codigo_centro?: string | undefined;
    id_jefe_centro?: number | null | undefined;
    parroquia_id?: number | undefined;
}>, {
    estado_id?: number | undefined;
    municipio_id?: number | undefined;
    nombre_centro?: string | undefined;
    ubicacion_centro?: string | undefined;
    codigo_centro?: string | undefined;
    id_jefe_centro?: number | null | undefined;
    parroquia_id?: number | undefined;
}, {
    estado_id?: number | undefined;
    municipio_id?: number | undefined;
    nombre_centro?: string | undefined;
    ubicacion_centro?: string | undefined;
    codigo_centro?: string | undefined;
    id_jefe_centro?: number | null | undefined;
    parroquia_id?: number | undefined;
}>;
export declare const subregionDetalleSchema: z.ZodObject<{
    id_subregion: z.ZodNumber;
    ubicacion: z.ZodString;
    parroquia_id: z.ZodNullable<z.ZodNumber>;
    municipio_id: z.ZodNullable<z.ZodNumber>;
    estado_id: z.ZodNullable<z.ZodNumber>;
    id_jefe_subregion: z.ZodNullable<z.ZodNumber>;
    nombre_estado: z.ZodNullable<z.ZodString>;
    nombre_municipio: z.ZodNullable<z.ZodString>;
    nombre_parroquia: z.ZodNullable<z.ZodString>;
    jefe_subregion: z.ZodNullable<z.ZodObject<{
        id_autoridades: z.ZodNumber;
        primer_nombre: z.ZodString;
        segundo_nombre: z.ZodString;
        primer_apellido: z.ZodString;
        segundo_apellido: z.ZodString;
        c_i: z.ZodNumber;
        n_impre: z.ZodNumber;
        telefono: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id_autoridades: number;
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
        c_i: number;
        n_impre: number;
        telefono: string;
    }, {
        id_autoridades: number;
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
        c_i: number;
        n_impre: number;
        telefono: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    nombre_estado: string | null;
    nombre_municipio: string | null;
    estado_id: number | null;
    nombre_parroquia: string | null;
    municipio_id: number | null;
    parroquia_id: number | null;
    id_subregion: number;
    ubicacion: string;
    id_jefe_subregion: number | null;
    jefe_subregion: {
        id_autoridades: number;
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
        c_i: number;
        n_impre: number;
        telefono: string;
    } | null;
}, {
    nombre_estado: string | null;
    nombre_municipio: string | null;
    estado_id: number | null;
    nombre_parroquia: string | null;
    municipio_id: number | null;
    parroquia_id: number | null;
    id_subregion: number;
    ubicacion: string;
    id_jefe_subregion: number | null;
    jefe_subregion: {
        id_autoridades: number;
        primer_nombre: string;
        segundo_nombre: string;
        primer_apellido: string;
        segundo_apellido: string;
        c_i: number;
        n_impre: number;
        telefono: string;
    } | null;
}>;
export declare const subregionesQuerySchema: z.ZodObject<{
    estado_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    estado_id?: number | undefined;
}, {
    estado_id?: number | undefined;
}>;
export declare const createSubregionBodySchema: z.ZodObject<{
    ubicacion: z.ZodString;
    estado_id: z.ZodNumber;
    municipio_id: z.ZodNumber;
    parroquia_id: z.ZodNumber;
    id_jefe_subregion: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    estado_id: number;
    municipio_id: number;
    parroquia_id: number;
    ubicacion: string;
    id_jefe_subregion?: number | null | undefined;
}, {
    estado_id: number;
    municipio_id: number;
    parroquia_id: number;
    ubicacion: string;
    id_jefe_subregion?: number | null | undefined;
}>;
export declare const updateSubregionBodySchema: z.ZodEffects<z.ZodObject<{
    ubicacion: z.ZodOptional<z.ZodString>;
    estado_id: z.ZodOptional<z.ZodNumber>;
    municipio_id: z.ZodOptional<z.ZodNumber>;
    parroquia_id: z.ZodOptional<z.ZodNumber>;
    id_jefe_subregion: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
}, "strip", z.ZodTypeAny, {
    estado_id?: number | undefined;
    municipio_id?: number | undefined;
    parroquia_id?: number | undefined;
    ubicacion?: string | undefined;
    id_jefe_subregion?: number | null | undefined;
}, {
    estado_id?: number | undefined;
    municipio_id?: number | undefined;
    parroquia_id?: number | undefined;
    ubicacion?: string | undefined;
    id_jefe_subregion?: number | null | undefined;
}>, {
    estado_id?: number | undefined;
    municipio_id?: number | undefined;
    parroquia_id?: number | undefined;
    ubicacion?: string | undefined;
    id_jefe_subregion?: number | null | undefined;
}, {
    estado_id?: number | undefined;
    municipio_id?: number | undefined;
    parroquia_id?: number | undefined;
    ubicacion?: string | undefined;
    id_jefe_subregion?: number | null | undefined;
}>;
export type AutoridadDetalle = z.infer<typeof autoridadDetalleSchema>;
export type AutoridadesQuery = z.infer<typeof autoridadesQuerySchema>;
export type CreateAutoridadBody = z.infer<typeof createAutoridadBodySchema>;
export type UpdateAutoridadBody = z.infer<typeof updateAutoridadBodySchema>;
export type CentroSaludDetalle = z.infer<typeof centroSaludDetalleSchema>;
export type CentrosSaludQuery = z.infer<typeof centrosSaludQuerySchema>;
export type CreateCentroSaludBody = z.infer<typeof createCentroSaludBodySchema>;
export type UpdateCentroSaludBody = z.infer<typeof updateCentroSaludBodySchema>;
export type SubregionDetalle = z.infer<typeof subregionDetalleSchema>;
export type SubregionesQuery = z.infer<typeof subregionesQuerySchema>;
export type CreateSubregionBody = z.infer<typeof createSubregionBodySchema>;
export type UpdateSubregionBody = z.infer<typeof updateSubregionBodySchema>;
