import { z } from 'zod';
import { TIPO_USUARIO_VALUES } from '../../db/schema.js';
export const loginBodySchema = z.object({
    correo_usuario: z
        .string({ required_error: 'El correo electrónico es obligatorio.' })
        .trim()
        .email('Debe ingresar un correo electrónico válido.')
        .max(255, 'El correo electrónico no puede superar los 255 caracteres.')
        .transform((value) => value.toLowerCase()),
    contrasena: z
        .string({ required_error: 'La contraseña es obligatoria.' })
        .min(1, 'La contraseña es obligatoria.')
        .max(255, 'La contraseña no puede superar los 255 caracteres.'),
});
export const autoridadResumenSchema = z.object({
    id_autoridades: z.number().int().positive(),
    primer_nombre: z.string(),
    segundo_nombre: z.string(),
    primer_apellido: z.string(),
    segundo_apellido: z.string(),
    c_i: z.number().int(),
    n_impre: z.number().int(),
    domicilio: z.string().nullable(),
    telefono: z.string(),
    profesion_id: z.number().int().positive().nullable(),
    nombre_profesion: z.string().nullable(),
});
export const centroSaludResumenSchema = z.object({
    id_centro: z.number().int().positive(),
    nombre_centro: z.string(),
    ubicacion_centro: z.string(),
    codigo_centro: z.string(),
    parroquia_id: z.number().int().positive().nullable(),
    municipio_id: z.number().int().positive().nullable(),
    estado_id: z.number().int().positive().nullable(),
});
export const subregionResumenSchema = z.object({
    id_subregion: z.number().int().positive(),
    ubicacion: z.string(),
    parroquia_id: z.number().int().positive().nullable(),
    municipio_id: z.number().int().positive().nullable(),
    estado_id: z.number().int().positive().nullable(),
});
export const authUserProfileSchema = z.object({
    id_usuarios: z.number().int().positive(),
    correo_usuario: z.string().email(),
    tipo_usuario: z.enum(TIPO_USUARIO_VALUES),
    id_autoridades: z.number().int().positive().nullable(),
    id_centro: z.number().int().positive().nullable(),
    id_subregion: z.number().int().positive().nullable(),
    estado_id: z.number().int().positive().nullable(),
    autoridad: autoridadResumenSchema.nullable(),
    centro_salud: centroSaludResumenSchema.nullable(),
    subregion: subregionResumenSchema.nullable(),
});
export const authSuccessResponseSchema = z.object({
    ok: z.literal(true),
    data: z.object({
        user: authUserProfileSchema,
    }),
});
export const logoutResponseSchema = z.object({
    ok: z.literal(true),
    message: z.string(),
});
//# sourceMappingURL=auth.schemas.js.map