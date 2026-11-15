import { z } from 'zod';
export const idParamSchema = z.object({
    id: z.coerce
        .number({ invalid_type_error: 'El identificador debe ser numérico.' })
        .int('El identificador debe ser un número entero.')
        .positive('El identificador debe ser mayor que cero.'),
});
export const estadoSchema = z.object({
    id_estado: z.number().int().positive(),
    nombre_estado: z.string(),
});
export const municipiosQuerySchema = z.object({
    estado_id: z.coerce.number().int().positive().optional(),
});
export const municipioSchema = z.object({
    id_municipio: z.number().int().positive(),
    nombre_municipio: z.string(),
    estado_id: z.number().int().positive().nullable(),
});
export const parroquiasQuerySchema = z.object({
    estado_id: z.coerce.number().int().positive().optional(),
    municipio_id: z.coerce.number().int().positive().optional(),
});
export const parroquiaSchema = z.object({
    id_parroquia: z.number().int().positive(),
    nombre_parroquia: z.string(),
    municipio_id: z.number().int().positive().nullable(),
    estado_id: z.number().int().positive().nullable(),
});
export const etniaSchema = z.object({
    id_etnia: z.number().int().positive(),
    nombre_etnia: z.string(),
});
export const profesionSchema = z.object({
    id_profesion: z.number().int().positive(),
    nombre_profesion: z.string(),
});
export const vacunaSchema = z.object({
    id_vacuna: z.number().int().positive(),
    nombre_vacuna: z.string(),
    cantidad_dosis: z.number().int().positive(),
});
export const createVacunaBodySchema = z.object({
    nombre_vacuna: z
        .string({ required_error: 'El nombre de la vacuna es obligatorio.' })
        .trim()
        .min(2, 'El nombre de la vacuna debe tener al menos 2 caracteres.')
        .max(100, 'El nombre de la vacuna no puede superar los 100 caracteres.'),
    cantidad_dosis: z
        .number({ required_error: 'La cantidad de dosis es obligatoria.' })
        .int('La cantidad de dosis debe ser un número entero.')
        .min(1, 'La vacuna debe requerir al menos 1 dosis.')
        .max(20, 'La cantidad de dosis no puede exceder 20.'),
});
export const updateVacunaBodySchema = createVacunaBodySchema
    .partial()
    .refine((data) => data.nombre_vacuna !== undefined || data.cantidad_dosis !== undefined, { message: 'Debe enviar al menos un campo para actualizar la vacuna.' });
export const sintomaComunSchema = z.object({
    id_sintoma: z.number().int().positive(),
    descripcion_sintoma: z.string().nullable(),
});
export const createSintomaComunBodySchema = z.object({
    descripcion_sintoma: z
        .string({ required_error: 'La descripción del síntoma es obligatoria.' })
        .trim()
        .min(2, 'La descripción debe tener al menos 2 caracteres.')
        .max(255, 'La descripción no puede superar los 255 caracteres.'),
});
export const examenSchema = z.object({
    id_examenes: z.number().int().positive(),
    nombre_examen: z.string(),
});
export const createExamenBodySchema = z.object({
    nombre_examen: z
        .string({ required_error: 'El nombre del examen es obligatorio.' })
        .trim()
        .min(2, 'El nombre del examen debe tener al menos 2 caracteres.')
        .max(100, 'El nombre del examen no puede superar los 100 caracteres.'),
});
export const catalogosResumenSchema = z.object({
    estados: z.array(estadoSchema),
    etnias: z.array(etniaSchema),
    profesiones: z.array(profesionSchema),
    vacunas: z.array(vacunaSchema),
    sintomas_comunes: z.array(sintomaComunSchema),
    examenes: z.array(examenSchema),
});
export function okSchema(dataSchema) {
    return z.object({
        ok: z.literal(true),
        data: dataSchema,
    });
}
//# sourceMappingURL=catalogos.schemas.js.map