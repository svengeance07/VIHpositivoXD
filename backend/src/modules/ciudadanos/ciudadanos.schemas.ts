import { z } from 'zod';

import { SEXO_VALUES, TIPO_SANGRE_VALUES } from '../../db/schema.js';
import { idParamSchema, okSchema } from '../catalogos/catalogos.schemas.js';

export { idParamSchema, okSchema };

const DATE_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoCalendarDate(value: string): boolean {
  if (!DATE_ISO_REGEX.test(value)) {
    return false;
  }

  const [yearRaw, monthRaw, dayRaw] = value.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1900
  ) {
    return false;
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return false;
  }

  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  return utcDate.getTime() <= todayUtc.getTime();
}

export const fechaNacimientoSchema = z
  .string({ required_error: 'La fecha de nacimiento es obligatoria.' })
  .trim()
  .refine(
    isValidIsoCalendarDate,
    'La fecha de nacimiento debe tener formato válido YYYY-MM-DD, no ser anterior a 1900 ni futura.',
  );

export const cedulaParamSchema = z.object({
  ci: z.coerce
    .number({ invalid_type_error: 'La cédula de identidad debe ser numérica.' })
    .int('La cédula de identidad debe ser un número entero.')
    .positive('La cédula de identidad debe ser mayor que cero.')
    .max(2147483647, 'La cédula excede el rango numérico permitido.'),
});

function optionalNullableTrimmed(maxLength: number) {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }
      if (value === null) {
        return null;
      }
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    })
    .refine((value) => value === undefined || value === null || value.length <= maxLength, {
      message: `El campo no puede superar los ${maxLength} caracteres.`,
    });
}

export const representanteResumenSchema = z.object({
  id_ciudadano: z.number().int().positive(),
  primer_nombre: z.string(),
  segundo_nombre: z.string().nullable(),
  primer_apellido: z.string(),
  segundo_apellido: z.string().nullable(),
  c_i: z.number().int(),
  telefono_celular: z.string().nullable(),
  telefono_domicilio: z.string().nullable(),
});

export const ciudadanoMenorDetalleSchema = z.object({
  id_menor: z.number().int().positive(),
  primer_nombre: z.string(),
  segundo_nombre: z.string().nullable(),
  primer_apellido: z.string(),
  segundo_apellido: z.string().nullable(),
  fecha_nacimiento: z.string(),
  sexo: z.enum(SEXO_VALUES),
  tipo_sangre: z.enum(TIPO_SANGRE_VALUES),
  estatura: z.number().int(),
  domicilio: z.string(),
  parroquia_id: z.number().int().positive().nullable(),
  municipio_id: z.number().int().positive().nullable(),
  estado_id: z.number().int().positive().nullable(),
  etnia_id: z.number().int().positive().nullable(),
  padre_id: z.number().int().positive().nullable(),
  nombre_etnia: z.string().nullable(),
  nombre_estado: z.string().nullable(),
  nombre_municipio: z.string().nullable(),
  nombre_parroquia: z.string().nullable(),
  representante: representanteResumenSchema.nullable(),
});

export const ciudadanoMayorDetalleSchema = z.object({
  id_ciudadano: z.number().int().positive(),
  primer_nombre: z.string(),
  segundo_nombre: z.string().nullable(),
  primer_apellido: z.string(),
  segundo_apellido: z.string().nullable(),
  c_i: z.number().int(),
  fecha_nacimiento: z.string(),
  sexo: z.enum(SEXO_VALUES),
  tipo_sangre: z.enum(TIPO_SANGRE_VALUES),
  estatura: z.number().int(),
  correo_electronico: z.string().nullable(),
  telefono_celular: z.string().nullable(),
  telefono_domicilio: z.string().nullable(),
  domicilio: z.string(),
  profesion_id: z.number().int().positive().nullable(),
  parroquia_id: z.number().int().positive().nullable(),
  municipio_id: z.number().int().positive().nullable(),
  estado_id: z.number().int().positive().nullable(),
  etnia_id: z.number().int().positive().nullable(),
  nombre_profesion: z.string().nullable(),
  nombre_etnia: z.string().nullable(),
  nombre_estado: z.string().nullable(),
  nombre_municipio: z.string().nullable(),
  nombre_parroquia: z.string().nullable(),
});

export const ciudadanoMayorConMenoresSchema = ciudadanoMayorDetalleSchema.extend({
  menores_a_cargo: z.array(ciudadanoMenorDetalleSchema),
});

const ciudadanoMayorBaseSchema = z.object({
  primer_nombre: z
    .string({ required_error: 'El primer nombre es obligatorio.' })
    .trim()
    .min(2)
    .max(50),
  segundo_nombre: optionalNullableTrimmed(50),
  primer_apellido: z
    .string({ required_error: 'El primer apellido es obligatorio.' })
    .trim()
    .min(2)
    .max(50),
  segundo_apellido: optionalNullableTrimmed(50),
  c_i: z
    .number({ required_error: 'La cédula de identidad es obligatoria.' })
    .int()
    .positive()
    .max(2147483647),
  fecha_nacimiento: fechaNacimientoSchema,
  sexo: z.enum(SEXO_VALUES),
  tipo_sangre: z.enum(TIPO_SANGRE_VALUES),
  estatura: z
    .number({ required_error: 'La estatura (en cm) es obligatoria.' })
    .int()
    .min(30, 'La estatura mínima válida es 30 cm.')
    .max(260, 'La estatura máxima válida es 260 cm.'),
  correo_electronico: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }
      if (value === null) {
        return null;
      }
      const trimmed = value.trim().toLowerCase();
      return trimmed.length > 0 ? trimmed : null;
    })
    .refine(
      (value) =>
        value === undefined ||
        value === null ||
        (value.length <= 100 && z.string().email().safeParse(value).success),
      {
        message: 'El correo electrónico debe ser válido y no superar los 100 caracteres.',
      },
    ),
  telefono_celular: optionalNullableTrimmed(20),
  telefono_domicilio: optionalNullableTrimmed(20),
  domicilio: z.string({ required_error: 'El domicilio es obligatorio.' }).trim().min(3).max(255),
  profesion_id: z.number({ required_error: 'La profesión es obligatoria.' }).int().positive(),
  estado_id: z.number({ required_error: 'El estado es obligatorio.' }).int().positive(),
  municipio_id: z.number({ required_error: 'El municipio es obligatorio.' }).int().positive(),
  parroquia_id: z.number({ required_error: 'La parroquia es obligatoria.' }).int().positive(),
  etnia_id: z.number({ required_error: 'La etnia es obligatoria.' }).int().positive(),
});

export const createCiudadanoMayorBodySchema = ciudadanoMayorBaseSchema;

export const updateCiudadanoMayorBodySchema = ciudadanoMayorBaseSchema
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Debe enviar al menos un campo para actualizar al ciudadano mayor de edad.',
  });

export const ciudadanosMayoresQuerySchema = z.object({
  c_i: z.coerce.number().int().positive().optional(),
  estado_id: z.coerce.number().int().positive().optional(),
  municipio_id: z.coerce.number().int().positive().optional(),
  parroquia_id: z.coerce.number().int().positive().optional(),
  etnia_id: z.coerce.number().int().positive().optional(),
  profesion_id: z.coerce.number().int().positive().optional(),
  sexo: z.enum(SEXO_VALUES).optional(),
  tipo_sangre: z.enum(TIPO_SANGRE_VALUES).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const ciudadanoMenorBaseSchema = z.object({
  primer_nombre: z
    .string({ required_error: 'El primer nombre es obligatorio.' })
    .trim()
    .min(2)
    .max(50),
  segundo_nombre: optionalNullableTrimmed(50),
  primer_apellido: z
    .string({ required_error: 'El primer apellido es obligatorio.' })
    .trim()
    .min(2)
    .max(50),
  segundo_apellido: optionalNullableTrimmed(50),
  fecha_nacimiento: fechaNacimientoSchema,
  sexo: z.enum(SEXO_VALUES),
  tipo_sangre: z.enum(TIPO_SANGRE_VALUES),
  estatura: z
    .number({ required_error: 'La estatura (en cm) es obligatoria.' })
    .int()
    .min(20, 'La estatura mínima válida es 20 cm.')
    .max(240, 'La estatura máxima válida es 240 cm.'),
  domicilio: z.string({ required_error: 'El domicilio es obligatorio.' }).trim().min(3).max(255),
  estado_id: z.number({ required_error: 'El estado es obligatorio.' }).int().positive(),
  municipio_id: z.number({ required_error: 'El municipio es obligatorio.' }).int().positive(),
  parroquia_id: z.number({ required_error: 'La parroquia es obligatoria.' }).int().positive(),
  etnia_id: z.number({ required_error: 'La etnia es obligatoria.' }).int().positive(),
  padre_id: z
    .number({ required_error: 'El representante (padre_id) es obligatorio.' })
    .int()
    .positive(),
});

export const createCiudadanoMenorBodySchema = ciudadanoMenorBaseSchema;

export const createMenorDeRepresentanteBodySchema = ciudadanoMenorBaseSchema.omit({
  padre_id: true,
});

export const updateCiudadanoMenorBodySchema = ciudadanoMenorBaseSchema
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Debe enviar al menos un campo para actualizar al ciudadano menor de edad.',
  });

export const ciudadanosMenoresQuerySchema = z.object({
  padre_id: z.coerce.number().int().positive().optional(),
  padre_ci: z.coerce.number().int().positive().optional(),
  estado_id: z.coerce.number().int().positive().optional(),
  municipio_id: z.coerce.number().int().positive().optional(),
  parroquia_id: z.coerce.number().int().positive().optional(),
  etnia_id: z.coerce.number().int().positive().optional(),
  sexo: z.enum(SEXO_VALUES).optional(),
  tipo_sangre: z.enum(TIPO_SANGRE_VALUES).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const deleteCiudadanoResponseSchema = z.object({
  ok: z.literal(true),
  message: z.string(),
});

export type RepresentanteResumen = z.infer<typeof representanteResumenSchema>;
export type CiudadanoMenorDetalle = z.infer<typeof ciudadanoMenorDetalleSchema>;
export type CiudadanoMayorDetalle = z.infer<typeof ciudadanoMayorDetalleSchema>;
export type CiudadanoMayorConMenores = z.infer<typeof ciudadanoMayorConMenoresSchema>;

export type CreateCiudadanoMayorBody = z.infer<typeof createCiudadanoMayorBodySchema>;
export type UpdateCiudadanoMayorBody = z.infer<typeof updateCiudadanoMayorBodySchema>;
export type CiudadanosMayoresQuery = z.infer<typeof ciudadanosMayoresQuerySchema>;

export type CreateCiudadanoMenorBody = z.infer<typeof createCiudadanoMenorBodySchema>;
export type CreateMenorDeRepresentanteBody = z.infer<typeof createMenorDeRepresentanteBodySchema>;
export type UpdateCiudadanoMenorBody = z.infer<typeof updateCiudadanoMenorBodySchema>;
export type CiudadanosMenoresQuery = z.infer<typeof ciudadanosMenoresQuerySchema>;
