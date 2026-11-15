import { z } from 'zod';

import { TIPO_USUARIO_VALUES } from '../../db/schema.js';
import { idParamSchema, okSchema } from '../catalogos/catalogos.schemas.js';

export { idParamSchema, okSchema };

export const jefeResumenSchema = z.object({
  id_autoridades: z.number().int().positive(),
  primer_nombre: z.string(),
  segundo_nombre: z.string(),
  primer_apellido: z.string(),
  segundo_apellido: z.string(),
  c_i: z.number().int(),
  n_impre: z.number().int(),
  telefono: z.string(),
});

export const autoridadDetalleSchema = z.object({
  id_autoridades: z.number().int().positive(),
  primer_nombre: z.string(),
  segundo_nombre: z.string(),
  primer_apellido: z.string(),
  segundo_apellido: z.string(),
  c_i: z.number().int(),
  n_impre: z.number().int(),
  domicilio: z.string().nullable(),
  telefono: z.string(),
  usuario_id: z.number().int().positive().nullable(),
  profesion_id: z.number().int().positive().nullable(),
  nombre_profesion: z.string().nullable(),
  correo_usuario: z.string().nullable(),
  tipo_usuario: z.enum(TIPO_USUARIO_VALUES).nullable(),
  id_centro_asignado: z.number().int().positive().nullable(),
  id_subregion_asignada: z.number().int().positive().nullable(),
});

export const autoridadesQuerySchema = z.object({
  c_i: z.coerce.number().int().positive().optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

const cuentaUsuarioInputSchema = z.object({
  correo_usuario: z
    .string({ required_error: 'El correo electrónico de la cuenta es obligatorio.' })
    .trim()
    .email('Debe ingresar un correo electrónico válido.')
    .max(255)
    .transform((value) => value.toLowerCase()),
  contrasena: z
    .string({ required_error: 'La contraseña de la cuenta es obligatoria.' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(255),
  tipo_usuario: z.enum(TIPO_USUARIO_VALUES),
});

const autoridadBaseObjectSchema = z.object({
  primer_nombre: z
    .string({ required_error: 'El primer nombre es obligatorio.' })
    .trim()
    .min(2)
    .max(50),
  segundo_nombre: z
    .string({ required_error: 'El segundo nombre es obligatorio.' })
    .trim()
    .min(1)
    .max(50),
  primer_apellido: z
    .string({ required_error: 'El primer apellido es obligatorio.' })
    .trim()
    .min(2)
    .max(50),
  segundo_apellido: z
    .string({ required_error: 'El segundo apellido es obligatorio.' })
    .trim()
    .min(1)
    .max(50),
  c_i: z
    .number({ required_error: 'La cédula de identidad es obligatoria.' })
    .int()
    .positive()
    .max(2147483647),
  n_impre: z
    .number({ required_error: 'El número de registro profesional es obligatorio.' })
    .int()
    .positive()
    .max(2147483647),
  domicilio: z.string().trim().max(255).nullable().optional(),
  telefono: z.string({ required_error: 'El teléfono es obligatorio.' }).trim().min(7).max(20),
  profesion_id: z.number({ required_error: 'La profesión es obligatoria.' }).int().positive(),
  usuario_id: z.number().int().positive().nullable().optional(),
  cuenta_usuario: cuentaUsuarioInputSchema.optional(),
});

export const createAutoridadBodySchema = autoridadBaseObjectSchema.refine(
  (data) =>
    !(
      data.usuario_id !== undefined &&
      data.usuario_id !== null &&
      data.cuenta_usuario !== undefined
    ),
  {
    message: 'No puede indicar simultáneamente usuario_id y cuenta_usuario; elija solo una opción.',
  },
);

export const updateAutoridadBodySchema = autoridadBaseObjectSchema
  .omit({ usuario_id: true, cuenta_usuario: true })
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Debe enviar al menos un campo para actualizar la autoridad.',
  });

export const centroSaludDetalleSchema = z.object({
  id_centro: z.number().int().positive(),
  nombre_centro: z.string(),
  ubicacion_centro: z.string(),
  codigo_centro: z.string(),
  id_jefe_centro: z.number().int().positive().nullable(),
  parroquia_id: z.number().int().positive().nullable(),
  municipio_id: z.number().int().positive().nullable(),
  estado_id: z.number().int().positive().nullable(),
  nombre_estado: z.string().nullable(),
  nombre_municipio: z.string().nullable(),
  nombre_parroquia: z.string().nullable(),
  jefe_centro: jefeResumenSchema.nullable(),
});

export const centrosSaludQuerySchema = z.object({
  estado_id: z.coerce.number().int().positive().optional(),
  municipio_id: z.coerce.number().int().positive().optional(),
  parroquia_id: z.coerce.number().int().positive().optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

const centroSaludBaseObjectSchema = z.object({
  nombre_centro: z
    .string({ required_error: 'El nombre del centro es obligatorio.' })
    .trim()
    .min(2)
    .max(100),
  ubicacion_centro: z
    .string({ required_error: 'La ubicación del centro es obligatoria.' })
    .trim()
    .min(3)
    .max(255),
  codigo_centro: z
    .string({ required_error: 'El código del centro es obligatorio.' })
    .trim()
    .min(2)
    .max(10)
    .transform((value) => value.toUpperCase()),
  id_jefe_centro: z.number().int().positive().nullable().optional(),
  estado_id: z.number().int().positive(),
  municipio_id: z.number().int().positive(),
  parroquia_id: z.number().int().positive(),
});

export const createCentroSaludBodySchema = centroSaludBaseObjectSchema;

export const updateCentroSaludBodySchema = centroSaludBaseObjectSchema
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Debe enviar al menos un campo para actualizar el centro de salud.',
  });

export const subregionDetalleSchema = z.object({
  id_subregion: z.number().int().positive(),
  ubicacion: z.string(),
  parroquia_id: z.number().int().positive().nullable(),
  municipio_id: z.number().int().positive().nullable(),
  estado_id: z.number().int().positive().nullable(),
  id_jefe_subregion: z.number().int().positive().nullable(),
  nombre_estado: z.string().nullable(),
  nombre_municipio: z.string().nullable(),
  nombre_parroquia: z.string().nullable(),
  jefe_subregion: jefeResumenSchema.nullable(),
});

export const subregionesQuerySchema = z.object({
  estado_id: z.coerce.number().int().positive().optional(),
});

const subregionBaseObjectSchema = z.object({
  ubicacion: z
    .string({ required_error: 'La ubicación de la subregión es obligatoria.' })
    .trim()
    .min(3)
    .max(255),
  estado_id: z.number().int().positive(),
  municipio_id: z.number().int().positive(),
  parroquia_id: z.number().int().positive(),
  id_jefe_subregion: z.number().int().positive().nullable().optional(),
});

export const createSubregionBodySchema = subregionBaseObjectSchema;

export const updateSubregionBodySchema = subregionBaseObjectSchema
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Debe enviar al menos un campo para actualizar la subregión.',
  });

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
